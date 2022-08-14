import React from 'react';
import {
  ComponentRendering,
  useSitecoreContext,
} from '@sitecore-jss/sitecore-jss-nextjs';
import { request } from 'graphql-request';
import { useSWRInfinite } from 'swr';
import { ProductListDocument, ProductListQuery, _Product, Item } from './ProductList.graphql';
import { SitecoreContextValues } from 'lib/page-props';
import { SitecoreTemplates } from 'lib/sitecoreTemplates';
import config from 'temp/config';
import { DocumentNode } from 'graphql';
import ListProduct from 'lib/helpers/ListProduct';

export type ProductListProps = {
  rendering: ComponentRendering;
};

type keyType = string | any[] | null;


// SWR will create arguments for each page based on this
const getKey = (
  itemId: string | undefined,
  pageIndex: number,
  previousPageData: ProductListQuery
): keyType => {
  // reached the end
  if (previousPageData && !previousPageData.search?.pageInfo.hasNext) return null;
  console.log('endCursor ' + JSON.stringify(previousPageData?.search?.pageInfo.endCursor));
  console.log('previousPageData ' + JSON.stringify(previousPageData));

  // first page, we don't have `previousPageData`
  if (pageIndex === 0) return [ProductListDocument, itemId, null];

  return [ProductListDocument, itemId, previousPageData?.search?.pageInfo.endCursor];
};

// SWR will execute this using the arguments formed above
const productListQuery = (query: DocumentNode, itemId: string, after?: string) => {
  // normalize item id
  itemId = itemId.split('-').join('').toLowerCase();
  // proxy the request through Next.js if running in browser
  const endpoint =
    typeof window === 'undefined'
      ? config.graphQLEndpoint
      : `${config.graphQLEndpointPath}?sc_apikey=${config.sitecoreApiKey}`;
  const data = request(endpoint, query, {
    templateId: SitecoreTemplates._Product.Id,
    rootPath: itemId,
    after,
  });
  console.log('After ' + JSON.stringify(after));
  return data;
};

const ProductListInfiniteLoader = ({ rendering }: ProductListProps): JSX.Element => {

  const itemId = useSitecoreContext<SitecoreContextValues>().sitecoreContext?.itemId;

  const getKeyForItem = (pageIndex: number, previousPageData: any): keyType => {
    console.log('After ' + JSON.stringify(previousPageData));
    return getKey(itemId, pageIndex, previousPageData);
  };
  const { data, size, setSize } = useSWRInfinite<ProductListQuery>(
    getKeyForItem,
    productListQuery,
    {
      revalidateAll: true,
    }
  );
  // console.log('Data from Component ' + JSON.stringify(data));
  return (
    <div className="container">
      <div className="product-list-columns columns is-multiline">
        {data &&
          data.map((page) => {
            return page.search?.results?.map((productItem) => {
              const product = productItem as _Product;
              const item = productItem as Item;
              return (
                <ListProduct key={item.url.path} url={item.url.path} imageSrc={product.image?.src}>
                  <h4>{product.title?.value}</h4>
                  <p>{product.shortDescription?.value}</p>
                </ListProduct>
              );
            });
          })}
      </div>

      {data && data[data.length - 1].search?.pageInfo.hasNext && (
        <div className="columns is-mobile is-centered">
          <button className="column is-one-quarter" onClick={() => setSize(size + 1)}>
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductListInfiniteLoader;
