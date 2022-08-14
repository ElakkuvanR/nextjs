import React from 'react';
import { HomePage, NavigationQuery, NavigationDocument } from './Navigation.graphql';
import { useNavigationData } from './NavigationDataContext';
import {
  GetStaticComponentProps,
  GraphQLRequestClient,
  ComponentRendering,
  useComponentProps,
} from '@sitecore-jss/sitecore-jss-nextjs';
import config from '../../temp/config';

export type ProductListProps = {
  rendering: ComponentRendering;
};

const Footer = ({ rendering }: ProductListProps): JSX.Element => {
  const data = useComponentProps<NavigationQuery>(rendering.uid);
  const homeItem = data?.item as HomePage;

  return (
    <footer className="footer footer-extended">
      <div className="content container">
        <p>{homeItem.footerCopyright?.value} &copy; 2018-{new Date().getFullYear()}</p>
      </div>
    </footer>
  );
};
export const getStaticProps: GetStaticComponentProps = async (rendering, layoutData) => {
  if (process.env.JSS_MODE === 'disconnected') {
    return null;
  }
  const graphQLClient = new GraphQLRequestClient(config.graphQLEndpoint, {
    apiKey: config.sitecoreApiKey,
  });
  const result = await graphQLClient.request<NavigationQuery>(NavigationDocument, {
    rootPath: '/sitecore/content/BasicCompany/Home',
    language: layoutData.sitecore.context.language,
    templateId: [
      '{81651C92-CF17-4751-9C9E-AF87E3C2918C}',
      '{9F57204E-5CE2-4FE8-98F7-9823EC53E8CC}',
    ],
  });
  return result;
};
export default Footer;
