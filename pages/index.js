import { useEffect, useState, useContext } from 'react';
import Container from '../components/Container';
import ContentBlock from '../components/ContentBlock';
import PropagateLoader from 'react-spinners/PropagateLoader';
import AppState from '../data/context';
import { generateClient } from 'aws-amplify/api';
import { listCategoriesWithLinks } from '../src/graphql/customQueries';
import { orderBy } from 'lodash';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [links, setLinks] = useState([]); // categories
  const [searchLinks, setSearchLinks] = useState([]);
  const { state } = useContext(AppState);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const client = generateClient({ authMode: 'apiKey' });
        let nextToken = null;
        const all = [];

        do {
          const { data, errors } = await client.graphql({
            query: listCategoriesWithLinks,
            variables: { limit: 200, nextToken },
          });

          if (errors?.length) {
            throw new Error(errors.map((e) => e.message).join(', '));
          }

          const page = data?.listCategories?.items || [];
          all.push(...page);
          nextToken = data?.listCategories?.nextToken || null;
        } while (nextToken);

        // Only show live categories/links on the public directory
        const liveCategories = (all || []).filter((c) => c?.isLive !== false);
        const sortedCategories = orderBy(liveCategories, [(c) => c?.order ?? 0], ['asc']);
        sortedCategories.forEach((cat) => {
          if (cat?.links?.items) {
            cat.links.items = orderBy(
              cat.links.items.filter((l) => Boolean(l) && l?.isLive !== false),
              [(l) => l?.order ?? 0],
              ['asc']
            );
          }
        });

        setLinks(sortedCategories);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (!state.isSearching) {
      setSearchLinks([]);
      return;
    }

    const q = (state.searchValue || '').trim().toLowerCase();
    if (!q) {
      setSearchLinks([]);
      return;
    }

    const allLinks = (links || []).flatMap((c) => c?.links?.items || []);
    const filtered = allLinks.filter((l) => {
      const title = (l?.title || '').toLowerCase();
      const desc = (l?.description || '').toLowerCase();
      return title.includes(q) || desc.includes(q);
    });
    setSearchLinks(filtered);
  }, [state.isSearching, state.searchValue, links]);

  return (
    <Container>
      {isLoading && !error ? (
        <div className='loader'>
          <div className='loader__text'>Loading Links</div>
          <PropagateLoader color={'#be7a47'} />
        </div>
      ) : !error ? (
        <ContentBlock links={links} searchLinks={searchLinks} />
      ) : (
        <div className='flex just-center items-center text-3xl directory__title'>
          Internal server error.
          <br /> We are aware and working to resolve the issue.
        </div>
      )}
    </Container>
  );
}
