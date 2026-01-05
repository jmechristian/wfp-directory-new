import React, { useContext } from 'react';
import Logo from '../components/Logo';
import Head from 'next/head';
import Search from './Search';
import { AuthContext } from './AuthProvider';
import { useRouter } from 'next/router';

const Container = ({ children }) => {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  return (
    <>
      <Head>
        <title>WFP Directory</title>
        <meta name='viewport' content='initial-scale=1.0, width=device-width' />
        <link rel='icon' type='image/x-icon' href='/favicon.ico'></link>
        <script
          async
          src='https://www.googletagmanager.com/gtag/js?id=G-JYHBRP2P3F'
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
            
              gtag('config', 'G-JYHBRP2P3F');
          `,
          }}
        />
      </Head>
      <div className='header__wrapper'>
        <div className='header__left'>
          <div className='logo__container'>
            <Logo />
          </div>
          <div className='directory__title'>
            WFP <span>Directory</span>
          </div>
        </div>
        <div className='header__right'>
          <Search />
          {user && user.type === 'admin' && (
            <div className='user__info'>
              <button onClick={() => router.push('/settings')}>BV</button>
            </div>
          )}
        </div>
      </div>
      <div className='page__container'>
        <div className='body__wrapper'>
          <div className='content__wrapper'>{children}</div>
        </div>
      </div>
    </>
  );
};

export default Container;
