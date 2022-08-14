import React from 'react';
import {
  _NavigationItem,
  Item,
  HomePage,
  NavigationDocument,
  NavigationQuery,
} from './Navigation.graphql';
import NextLink from 'next/link';
import {
  GetStaticComponentProps,
  useComponentProps,
  GraphQLRequestClient,
  ComponentRendering,
} from '@sitecore-jss/sitecore-jss-nextjs';
import config from '../../temp/config';
import { SitecoreTemplates } from '../../lib/sitecoreTemplates';

type NavItem = _NavigationItem & Item;

export type ProductListProps = {
  rendering: ComponentRendering;
};

const Header = ({ rendering }: ProductListProps): JSX.Element => {
  // Access the data with the useComponentProps<T> hook.
  const data = useComponentProps<NavigationQuery>(rendering.uid);
  const items = [data?.item, ...(data?.item?.children.results as NavItem[])];
  const homeItem = data?.item as HomePage;
  return (
    <nav className="navbar is-black is-tab" role="navigation" aria-label="main navigation">
      <div className="container">
        <div className="navbar-brand">
          {homeItem && (
            <a className="navbar-item" href={homeItem.url.path}>
              <img
                src={homeItem.headerLogo?.src || ''}
                alt={homeItem.navigationTitle?.value || 'Home'}
              />
            </a>
          )}

          <a
            role="button"
            className="navbar-burger burger"
            aria-label="menu"
            aria-expanded="false"
            data-target="navbarBasicExample"
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>

        <div id="navbarBasicExample" className="navbar-menu">
          <div className="navbar-start">
            {items &&
              items?.map((item, index) => {
                const navItem = item as NavItem;
                return (
                  <NextLink key={index} href={navItem?.url.path}>
                    <a className="navbar-item is-tab">{navItem?.navigationTitle?.value}</a>
                  </NextLink>
                );
              })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export const getStaticProps: GetStaticComponentProps = async (rendering, layoutData) => {
  if (process.env.JSS_MODE === 'disconnected') {
    return null;
  }
  // To make the GraphQLClient Request
  const graphQLClient = new GraphQLRequestClient(config.graphQLEndpoint, {
    apiKey: config.sitecoreApiKey,
  });
  const result = await graphQLClient.request<NavigationQuery>(NavigationDocument, {
    rootPath: layoutData.sitecore.route?.itemId, // root path
    language: layoutData.sitecore.context.language, // context language
    templateId: SitecoreTemplates.PageTypes.Id, // page template Ids
  });
  // console.log('GraphQL Result is ' + JSON.stringify(result));
  return result;
};

export default Header;
