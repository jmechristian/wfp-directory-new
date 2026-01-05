import { useContext, useReducer } from 'react';
import { Amplify } from 'aws-amplify';
import awsExports from '../src/aws-exports';
import SearchState from '../data/context';
import reducer from '../data/reducer';
import '../styles/globals.scss';
import { AuthProvider } from '../components/AuthProvider';

Amplify.configure(awsExports, { ssr: true });

function MyApp({ Component, pageProps }) {
  const initialState = useContext(SearchState);
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <AuthProvider>
      <SearchState.Provider value={{ state, dispatch }}>
        <Component {...pageProps} />
      </SearchState.Provider>
    </AuthProvider>
  );
}

export default MyApp;
