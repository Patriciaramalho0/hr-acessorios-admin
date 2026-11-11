
import { Pagination } from "@/types/pagination";

type Props<TableData, TableName extends PropertyKey = string> = {
  page: number;
  limit: number;
  name: TableName;
  query: any;
};

type Response<TableData> = {
  data: TableData[];
  pagination: Pagination;
};

export async function queryPaginatedTable<
  TableData,
  TableName extends PropertyKey = string
>({
  page,
  limit,
  name,
  query,
}: Props<TableData, TableName>): Promise<Response<TableData>> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error(`Erro ao buscar ${String(name)}:`, error.message);
    throw new Error(
      `Erro ao consultar a tabela '${String(name)}': ${error.message}`
    );
  }

  const totalItems = count ?? 0;
  const totalPages = Math.ceil(totalItems / limit);

  const currentPage =
    totalPages === 0 ? 1 : Math.max(1, Math.min(page, totalPages));

  return {
    data: (data ?? []) as TableData[],
    pagination: {
      limit,
      current: currentPage,
      items: totalItems,
      pages: totalPages,
      next: currentPage < totalPages ? currentPage + 1 : null,
      prev: currentPage > 1 ? currentPage - 1 : null,
    },
  };
}
