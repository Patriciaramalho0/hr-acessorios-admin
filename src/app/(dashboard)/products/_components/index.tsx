
"use client";

import { Fragment, useState } from "react";

import AllProducts from "./products-table";
import ProductActions from "./ProductActions";
import ProductFilters from "./ProductFilters";

export default function Products() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  return (
    <Fragment>
      <ProductActions
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
      />

      <ProductFilters />

      <AllProducts
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
      />
    </Fragment>
  );
}
