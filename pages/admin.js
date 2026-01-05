import { useEffect, useMemo, useState } from 'react';
import CognitoGate from '../components/CognitoGate';
import { generateClient } from 'aws-amplify/api';
import { listCategoriesWithLinks } from '../src/graphql/customQueries';
import {
  createCategory as gqlCreateCategory,
  updateCategory as gqlUpdateCategory,
  deleteCategory as gqlDeleteCategory,
  createLink as gqlCreateLink,
  updateLink as gqlUpdateLink,
  deleteLink as gqlDeleteLink,
} from '../src/graphql/mutations';
import { orderBy } from 'lodash';
import styles from './admin.module.scss';
import {
  EyeIcon,
  EyeOffIcon,
  PlusIcon,
  PencilAltIcon,
  TrashIcon,
} from '@heroicons/react/outline';

const emptyCategory = { name: '', description: '', order: 1, isLive: true };
const emptyLink = {
  title: '',
  description: '',
  url: '',
  order: 1,
  isNew: false,
  isUpdated: false,
  lastUpdated: '',
  isLive: true,
};

function Modal({ title, onClose, children, footer }) {
  return (
    <div className={styles.modalOverlay} onMouseDown={onClose}>
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>{title}</div>
          <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose} type='button'>
            Close
          </button>
        </div>
        <div className={styles.modalBody}>{children}</div>
        {footer && <div className={styles.modalFooter}>{footer}</div>}
      </div>
    </div>
  );
}

function AdminInner({ isSignedIn, signOut, authError, signInForm }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [dragCategoryIdx, setDragCategoryIdx] = useState(null);
  const [dragLinkIdx, setDragLinkIdx] = useState(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryDraft, setCategoryDraft] = useState(emptyCategory);
  const [categoryModalError, setCategoryModalError] = useState('');
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkDraft, setLinkDraft] = useState(emptyLink);
  const [editingLink, setEditingLink] = useState(null);
  const [linkModalError, setLinkModalError] = useState('');

  const client = useMemo(() => generateClient(), []);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === selectedCategoryId) || null,
    [categories, selectedCategoryId]
  );

  const selectedLinks = useMemo(() => {
    return orderBy(selectedCategory?.links?.items || [], [(l) => l?.order ?? 0], ['asc']);
  }, [selectedCategory]);

  const refresh = async () => {
    setIsLoading(true);
    setError('');
    try {
      let nextToken = null;
      const all = [];
      do {
        // eslint-disable-next-line no-await-in-loop
        const { data, errors } = await client.graphql({
          query: listCategoriesWithLinks,
          variables: { limit: 200, nextToken },
          authMode: 'apiKey',
        });
        if (errors?.length) throw new Error(errors.map((e) => e.message).join(', '));
        const page = data?.listCategories?.items || [];
        all.push(...page);
        nextToken = data?.listCategories?.nextToken || null;
      } while (nextToken);

      const cats = orderBy(all, [(c) => c?.order ?? 0], ['asc']);
      cats.forEach((c) => {
        if (c?.links?.items) {
          c.links.items = orderBy(c.links.items, [(l) => l?.order ?? 0], ['asc']);
        }
      });

      setCategories(cats);
      if ((!selectedCategoryId || !cats.some((c) => c.id === selectedCategoryId)) && cats.length) {
        setSelectedCategoryId(cats[0].id);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isSignedIn) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn]);

  const reorderCategories = async (fromIdx, toIdx) => {
    const next = categories.slice();
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    const reOrdered = next.map((x, i) => ({ ...x, order: i + 1 }));
    setCategories(reOrdered);
    for (const x of reOrdered) {
      // eslint-disable-next-line no-await-in-loop
      await client.graphql({
        query: gqlUpdateCategory,
        variables: { input: { id: x.id, order: x.order } },
        authMode: 'userPool',
      });
    }
    await refresh();
  };

  const reorderLinks = async (fromIdx, toIdx) => {
    const next = selectedLinks.slice();
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    for (let i = 0; i < next.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      await client.graphql({
        query: gqlUpdateLink,
        variables: { input: { id: next[i].id, order: i + 1 } },
        authMode: 'userPool',
      });
    }
    await refresh();
  };

  const onCreateCategory = async (e) => {
    e.preventDefault();
    setError('');
    setCategoryModalError('');
    try {
      const { errors } = await client.graphql({
        query: gqlCreateCategory,
        variables: {
          input: {
            name: categoryDraft.name,
            description: categoryDraft.description || null,
            order: Number(categoryDraft.order || 0),
            isLive: !!categoryDraft.isLive,
          },
        },
        authMode: 'userPool',
      });
      if (errors?.length) throw new Error(errors.map((x) => x.message).join(', '));

      setIsCategoryModalOpen(false);
      setCategoryDraft(emptyCategory);
      await refresh();
    } catch (err) {
      setCategoryModalError(err?.message || 'Unable to create category.');
    }
  };

  const onToggleCategoryLive = async (category) => {
    await client.graphql({
      query: gqlUpdateCategory,
      variables: { input: { id: category.id, isLive: !category.isLive } },
      authMode: 'userPool',
    });
    await refresh();
  };

  const onDeleteCategory = async (category) => {
    if (!confirm(`Delete category "${category.name}"?`)) return;
    await client.graphql({
      query: gqlDeleteCategory,
      variables: { input: { id: category.id } },
      authMode: 'userPool',
    });
    await refresh();
  };

  const onOpenCreateLink = () => {
    setEditingLink(null);
    setLinkModalError('');
    setLinkDraft({
      ...emptyLink,
      order: (selectedLinks?.length || 0) + 1,
      isLive: true,
    });
    setIsLinkModalOpen(true);
  };

  const onOpenEditLink = (link) => {
    setEditingLink(link);
    setLinkModalError('');
    setLinkDraft({
      title: link.title || '',
      description: link.description || '',
      url: link.url || '',
      order: link.order || 1,
      isNew: !!link.isNew,
      isUpdated: !!link.isUpdated,
      lastUpdated: link.lastUpdated || '',
      isLive: link.isLive !== false,
    });
    setIsLinkModalOpen(true);
  };

  const onSaveLink = async (e) => {
    e.preventDefault();
    setError('');
    setLinkModalError('');
    if (!selectedCategoryId) {
      setLinkModalError('No category selected.');
      return;
    }

    const url = (linkDraft.url || '').trim();
    if (url && !/^https?:\/\//i.test(url)) {
      setLinkModalError('URL must start with http:// or https://');
      return;
    }

    const input = {
      categoryId: selectedCategoryId,
      title: linkDraft.title,
      description: linkDraft.description || null,
      url,
      order: Number(linkDraft.order || 0),
      isNew: !!linkDraft.isNew,
      isUpdated: !!linkDraft.isUpdated,
      lastUpdated: linkDraft.lastUpdated ? linkDraft.lastUpdated : null,
      isLive: !!linkDraft.isLive,
    };

    try {
      if (editingLink) {
        const { errors } = await client.graphql({
          query: gqlUpdateLink,
          variables: { input: { id: editingLink.id, ...input } },
          authMode: 'userPool',
        });
        if (errors?.length) throw new Error(errors.map((x) => x.message).join(', '));
      } else {
        const { errors } = await client.graphql({
          query: gqlCreateLink,
          variables: { input },
          authMode: 'userPool',
        });
        if (errors?.length) throw new Error(errors.map((x) => x.message).join(', '));
      }

      setIsLinkModalOpen(false);
      setEditingLink(null);
      setLinkDraft(emptyLink);
      await refresh();
    } catch (err) {
      setLinkModalError(err?.message || 'Unable to save link.');
    }
  };

  const onToggleLinkLive = async (link) => {
    await client.graphql({
      query: gqlUpdateLink,
      variables: { input: { id: link.id, isLive: !link.isLive } },
      authMode: 'userPool',
    });
    await refresh();
  };

  const onDeleteLink = async (link) => {
    if (!confirm(`Delete link "${link.title}"?`)) return;
    await client.graphql({
      query: gqlDeleteLink,
      variables: { input: { id: link.id } },
      authMode: 'userPool',
    });
    await refresh();
  };

  if (!isSignedIn) {
    return (
      <div className={styles.page}>
        <div className={styles.shell}>
          <div className={styles.topbar}>
            <div>
              <div className={styles.title}>Directory Admin</div>
              <div className={styles.subtitle}>Sign in to manage categories and links</div>
            </div>
          </div>

          <div className={styles.loginWrap}>
            <div className={`${styles.card} ${styles.loginCard}`}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>Sign In</div>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.loginTitle}>Welcome back</div>
                <div className={styles.loginHint}>Use your Cognito admin credentials.</div>
                {authError && <div className={styles.error}>{authError}</div>}
                <form onSubmit={signInForm.onSubmit} className={styles.stack}>
                  <input
                    className={styles.input}
                    type='email'
                    placeholder='Email'
                    value={signInForm.email}
                    onChange={(e) => signInForm.setEmail(e.target.value)}
                    autoComplete='username'
                  />
                  <input
                    className={styles.input}
                    type='password'
                    placeholder='Password'
                    value={signInForm.password}
                    onChange={(e) => signInForm.setPassword(e.target.value)}
                    autoComplete='current-password'
                  />
                  <button className={styles.btn} type='submit'>
                    Sign in
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.topbar}>
          <div>
            <div className={styles.title}>Directory Admin</div>
            <div className={styles.subtitle}>Draft vs Live controls what appears publicly</div>
          </div>
          <div className={styles.actions}>
            <button
              className={`${styles.btn} ${styles.btnSecondary}`}
              type='button'
              onClick={signOut}
            >
              Sign out
            </button>
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={`${styles.cardGrid} ${styles.cardGridWide}`}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Categories</div>
              <button
                className={styles.iconBtn}
                type='button'
                aria-label='New category'
                title='New category'
                onClick={() => setIsCategoryModalOpen(true)}
              >
                <PlusIcon className={styles.icon} />
              </button>
            </div>
            <div className={styles.cardBody}>
              {isLoading ? (
                <div className={styles.subtitle}>Loading…</div>
              ) : (
                <div className={styles.list}>
                  {categories.map((c, idx) => (
                    <div
                      key={c.id}
                      className={`${styles.listItem} ${
                        c.id === selectedCategoryId ? styles.listItemActive : ''
                      }`}
                      onClick={() => setSelectedCategoryId(c.id)}
                      draggable
                      onDragStart={() => setDragCategoryIdx(idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={async () => {
                        if (dragCategoryIdx == null || dragCategoryIdx === idx) return;
                        await reorderCategories(dragCategoryIdx, idx);
                        setDragCategoryIdx(null);
                      }}
                    >
                      <div className={styles.dragHandle} title='Drag to reorder'>
                        ⋮⋮
                      </div>
                      <div className={styles.itemMain}>
                        <div className={styles.itemTitle}>{c.name}</div>
                        <div className={styles.itemMeta}>
                          Order {c.order} • {c.links?.items?.length || 0} links
                        </div>
                      </div>
                      <span className={styles.pill}>{c.isLive !== false ? 'Live' : 'Hidden'}</span>
                      <div className={styles.actions}>
                        <button
                          className={styles.iconBtn}
                          type='button'
                          aria-label={c.isLive !== false ? 'Hide category' : 'Show category'}
                          title={c.isLive !== false ? 'Hide' : 'Show'}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleCategoryLive(c);
                          }}
                        >
                          {c.isLive !== false ? (
                            <EyeOffIcon className={styles.icon} />
                          ) : (
                            <EyeIcon className={styles.icon} />
                          )}
                        </button>
                        <button
                          className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                          type='button'
                          aria-label='Delete category'
                          title='Delete'
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteCategory(c);
                          }}
                        >
                          <TrashIcon className={`${styles.icon} ${styles.iconDanger}`} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {!categories.length && <div className={styles.subtitle}>No categories.</div>}
                </div>
              )}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Links</div>
              <div className={styles.actions}>
                <select
                  className={styles.select}
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.order}. {c.name}
                    </option>
                  ))}
                </select>
                <button
                  className={styles.iconBtn}
                  type='button'
                  aria-label='New link'
                  title={selectedCategoryId ? 'New link' : 'Select a category to add a link'}
                  onClick={onOpenCreateLink}
                  disabled={!selectedCategoryId}
                >
                  <PlusIcon className={styles.icon} />
                </button>
              </div>
            </div>
            <div className={styles.cardBody}>
              {!selectedCategory ? (
                <div className={styles.subtitle}>Select a category.</div>
              ) : (
                <table className={styles.table}>
                  <colgroup>
                    <col style={{ width: 52 }} />
                    <col style={{ width: '42%' }} />
                    <col style={{ width: '18%' }} />
                    <col style={{ width: 140 }} />
                    <col style={{ width: 180 }} />
                  </colgroup>
                  <thead className={styles.thead}>
                    <tr>
                      <th></th>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Last Updated</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedLinks.map((l, idx) => (
                      <tr
                        key={l.id}
                        className={styles.row}
                        draggable
                        onDragStart={() => setDragLinkIdx(idx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={async () => {
                          if (dragLinkIdx == null || dragLinkIdx === idx) return;
                          await reorderLinks(dragLinkIdx, idx);
                          setDragLinkIdx(null);
                        }}
                      >
                        <td>
                          <div className={styles.dragHandle} title='Drag to reorder'>
                            ⋮⋮
                          </div>
                        </td>
                        <td>
                          <div className={styles.linkTitle}>{l.title}</div>
                          <div className={styles.linkUrl} title={l.url}>
                            {l.url}
                          </div>
                        </td>
                        <td>
                          <div className={styles.badges}>
                            <span className={styles.pill}>{l.isLive !== false ? 'Live' : 'Hidden'}</span>
                            {l.isNew && <span className={styles.badgeNew}>New</span>}
                            {l.isUpdated && <span className={styles.badgeUpdated}>Updated</span>}
                          </div>
                        </td>
                        <td>{l.lastUpdated || '—'}</td>
                        <td>
                          <div className={styles.actions}>
                            <button
                              className={styles.iconBtn}
                              type='button'
                              aria-label='Edit link'
                              title='Edit'
                              onClick={() => onOpenEditLink(l)}
                            >
                              <PencilAltIcon className={styles.icon} />
                            </button>
                            <button
                              className={styles.iconBtn}
                              type='button'
                              aria-label={l.isLive !== false ? 'Hide link' : 'Show link'}
                              title={l.isLive !== false ? 'Hide' : 'Show'}
                              onClick={() => onToggleLinkLive(l)}
                            >
                              {l.isLive !== false ? (
                                <EyeOffIcon className={styles.icon} />
                              ) : (
                                <EyeIcon className={styles.icon} />
                              )}
                            </button>
                            <button
                              className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                              type='button'
                              aria-label='Delete link'
                              title='Delete'
                              onClick={() => onDeleteLink(l)}
                            >
                              <TrashIcon className={`${styles.icon} ${styles.iconDanger}`} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!selectedLinks.length && (
                      <tr className={styles.row}>
                        <td colSpan={5} className={styles.subtitle}>
                          No links in this category.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {isCategoryModalOpen && (
        <Modal
          title='Create Category'
          onClose={() => {
            setIsCategoryModalOpen(false);
            setCategoryModalError('');
          }}
          footer={
            <>
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                type='button'
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setCategoryModalError('');
                }}
              >
                Cancel
              </button>
              <button className={styles.btn} type='submit' form='createCategoryForm'>
                Create
              </button>
            </>
          }
        >
          <form id='createCategoryForm' onSubmit={onCreateCategory} className={styles.stack}>
            {categoryModalError && <div className={styles.error}>{categoryModalError}</div>}
            <input
              className={styles.input}
              value={categoryDraft.name}
              onChange={(e) => setCategoryDraft({ ...categoryDraft, name: e.target.value })}
              placeholder='Name'
              required
            />
            <div className={styles.row2}>
              <input
                className={styles.input}
                value={categoryDraft.order}
                onChange={(e) => setCategoryDraft({ ...categoryDraft, order: Number(e.target.value || 0) })}
                placeholder='Order'
                type='number'
                required
              />
              <select
                className={styles.select}
                value={categoryDraft.isLive ? 'live' : 'hidden'}
                onChange={(e) => setCategoryDraft({ ...categoryDraft, isLive: e.target.value === 'live' })}
              >
                <option value='live'>Live</option>
                <option value='hidden'>Hidden</option>
              </select>
            </div>
            <textarea
              className={styles.textarea}
              value={categoryDraft.description}
              onChange={(e) => setCategoryDraft({ ...categoryDraft, description: e.target.value })}
              placeholder='Description (optional)'
            />
          </form>
        </Modal>
      )}

      {isLinkModalOpen && (
        <Modal
          title={editingLink ? 'Edit Link' : 'Create Link'}
          onClose={() => {
            setIsLinkModalOpen(false);
            setLinkModalError('');
          }}
          footer={
            <>
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                type='button'
                onClick={() => {
                  setIsLinkModalOpen(false);
                  setLinkModalError('');
                }}
              >
                Cancel
              </button>
              <button className={styles.btn} type='submit' form='linkForm'>
                Save
              </button>
            </>
          }
        >
          <form id='linkForm' onSubmit={onSaveLink} className={styles.stack}>
            {linkModalError && <div className={styles.error}>{linkModalError}</div>}
            <input
              className={styles.input}
              value={linkDraft.title}
              onChange={(e) => setLinkDraft({ ...linkDraft, title: e.target.value })}
              placeholder='Title'
              required
            />
            <input
              className={styles.input}
              value={linkDraft.url}
              onChange={(e) => setLinkDraft({ ...linkDraft, url: e.target.value })}
              placeholder='URL'
              required
            />
            <div className={styles.row2}>
              <input
                className={styles.input}
                value={linkDraft.order}
                onChange={(e) => setLinkDraft({ ...linkDraft, order: Number(e.target.value || 0) })}
                placeholder='Order'
                type='number'
                required
              />
              <select
                className={styles.select}
                value={linkDraft.isLive ? 'live' : 'hidden'}
                onChange={(e) => setLinkDraft({ ...linkDraft, isLive: e.target.value === 'live' })}
              >
                <option value='live'>Live</option>
                <option value='hidden'>Hidden</option>
              </select>
            </div>
            <textarea
              className={styles.textarea}
              value={linkDraft.description}
              onChange={(e) => setLinkDraft({ ...linkDraft, description: e.target.value })}
              placeholder='Description (optional)'
            />
            <div className={styles.row2}>
              <select
                className={styles.select}
                value={linkDraft.isNew ? 'yes' : 'no'}
                onChange={(e) => setLinkDraft({ ...linkDraft, isNew: e.target.value === 'yes' })}
              >
                <option value='no'>New: No</option>
                <option value='yes'>New: Yes</option>
              </select>
              <select
                className={styles.select}
                value={linkDraft.isUpdated ? 'yes' : 'no'}
                onChange={(e) => setLinkDraft({ ...linkDraft, isUpdated: e.target.value === 'yes' })}
              >
                <option value='no'>Updated: No</option>
                <option value='yes'>Updated: Yes</option>
              </select>
            </div>
            <input
              className={styles.input}
              value={linkDraft.lastUpdated}
              onChange={(e) => setLinkDraft({ ...linkDraft, lastUpdated: e.target.value })}
              placeholder='Last Updated (YYYY-MM-DD, optional)'
            />
          </form>
        </Modal>
      )}

    </div>
  );
}

export default function Admin() {
  return (
    <CognitoGate title='Admin Login'>
      {({ isLoading, isSignedIn, error, email, setEmail, password, setPassword, signIn, signOut }) => (
        <AdminInner
          isSignedIn={isSignedIn}
          signOut={signOut}
          authError={error}
          signInForm={{
            isLoading,
            email,
            setEmail,
            password,
            setPassword,
            onSubmit: signIn,
          }}
        />
      )}
    </CognitoGate>
  );
}

