import React, { useState } from 'react';
import { request } from 'graphql-request';
import useSWR from 'swr';
import { ComponentRendering, useSitecoreContext } from '@sitecore-jss/sitecore-jss-nextjs';
import { ProductListDocument, _Product, Item } from './ProductList.graphql';
import config from 'temp/config';
import { DocumentNode } from 'graphql';
import ListProduct from 'lib/helpers/ListProduct';
import { SitecoreTemplates } from 'lib/sitecoreTemplates';
import { SitecoreContextValues } from 'lib/page-props';

export type ProductListProps = {
  rendering: ComponentRendering;
};

const endpoint =
  typeof window === 'undefined'
    ? config.graphQLEndpoint
    : `${config.graphQLEndpointPath}?sc_apikey=${config.sitecoreApiKey}`;

const ProductList = (): JSX.Element => {
  const [pageIndex, setPageIndex] = useState(0);
  const after = (pageIndex * 4).toString();
  const afterBase64 = Buffer.from(after).toString('base64');
  const itemId = useSitecoreContext<SitecoreContextValues>().sitecoreContext?.itemId;

  // SWR Fetcher function that makes Graphql request
  const fetcher = (query: DocumentNode, templteid: string, rootid: string, pageIndex: string) =>
    request(endpoint, query, {
      templateId: templteid,
      rootPath: rootid,
      after: afterBase64,
    });

  const setPageNumber = (page: number): Boolean => {
    if (!(data && data.search?.total > page * 4) || page < 0) {
      return false;
    }
    setPageIndex(page);
    return true;
  };

  // SWR Call. SWR will execute based on the query passed
  const { data, error } = useSWR(
    [ProductListDocument, SitecoreTemplates._Product.Id, itemId, pageIndex],
    fetcher
  );
  const totalPage = data && data.search.total / 4;

  return (
    <div className="container">
      <div className="product-list-columns columns is-multiline">
        {data &&
          data.search.results.map((page: _Product) => {
            const product = page as _Product;
            const item = page as Item;
            return (
              <ListProduct key={item.url.path} url={item.url.path} imageSrc={product.image?.src}>
                <h4>{product.title?.value}</h4>
                <p>{product.shortDescription?.value}</p>
              </ListProduct>
            );
          })}
      </div>
      <div className="pagination">
        <div>
          <a
            onClick={() => setPageNumber(pageIndex - 1)}
            className={pageIndex < 1 ? 'disabledCursor' : ''}
          >
            ❮
          </a>
        </div>
        <div className="info">
          <span>
            {pageIndex + 1} of {totalPage}
          </span>
        </div>
        <div>
          <a
            onClick={() => setPageNumber(pageIndex + 1)}
            className={data && !data.search?.pageInfo.hasNext ? 'disabledCursor' : ''}
          >
            ❯
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
