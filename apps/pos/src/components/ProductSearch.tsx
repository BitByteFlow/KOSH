import React, { useState, useEffect } from 'react';
import { useLazyQuery } from '@apollo/client/react';
import { LIST_PRODUCTS } from '../graphql/operations';
import type { ProductVariant } from '../types';
import { Search, Plus, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from "@kosh/ui/components/input";
import { Card, CardContent } from "@kosh/ui/components/card";
import { Badge } from "@kosh/ui/components/badge";
import { Button } from "@kosh/ui/components/button";

interface ProductSearchProps {
  onSelect: (variant: ProductVariant) => void;
  externalSearch?: string;
}

const ProductSearch: React.FC<ProductSearchProps> = ({ onSelect, externalSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchProducts, { data, loading }] = useLazyQuery(LIST_PRODUCTS);

  useEffect(() => {
    if (externalSearch) {
      setSearchTerm(externalSearch);
      handleSearch(externalSearch);
    }
  }, [externalSearch]);

  const handleSearch = (term: string) => {
    if (term.length < 2) return;
    searchProducts({
      variables: {
        filterInput: {
          search: term,
          page: 1,
          limit: 10
        }
      }
    });
  };

  const results = (data as any)?.listProductsWithFilter?.data || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <Input
          placeholder="Search products by name or SKU..."
          className="pl-11 h-12 text-base rounded-xl border-slate-200"
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchTerm(e.target.value);
            handleSearch(e.target.value);
          }}
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Loader2 className="animate-spin text-primary" size={18} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2">
        <AnimatePresence mode="popLayout">
          {results.map((product: any) => (
            product.variants.map((variant: any) => (
              <motion.div
                key={variant.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                <Card 
                  className="hover:border-primary/50 transition-colors cursor-pointer group border-slate-200 bg-white"
                  onClick={() => onSelect({ ...variant, product: { id: product.id, name: product.productName } })}
                 >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800">
                          {product.productName}
                        </h4>
                        {variant.attributeValue && (
                          <Badge variant="secondary" className="text-[10px] h-4 px-1 bg-slate-100 text-slate-500 border-none">
                            {variant.attributeValue}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                        {variant.sku}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-black text-slate-900">${variant.sellingPrice.toFixed(2)}</p>
                        <p className={`text-[9px] uppercase font-bold ${variant.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {variant.stock} in stock
                        </p>
                      </div>
                      <Button size="icon" variant="ghost" className="rounded-full bg-slate-50 group-hover:bg-primary group-hover:text-white transition-all h-9 w-9">
                        <Plus size={18} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ))}
        </AnimatePresence>

        {!loading && searchTerm.length >= 2 && results.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <p className="font-medium">No results found for "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSearch;
