# Capas das categorias

## Como usar

1. Abra **Categorias** no painel e clique no lápis da categoria.
2. Em **Imagem de capa**, escolha um arquivo JPG, PNG ou WebP de até 3 MB.
3. Confira a prévia e clique em **Salvar alterações**.
4. Recarregue a loja para conferir a categoria.

Para trocar a capa, selecione outro arquivo e salve. Para retirar a capa personalizada, clique em **Remover capa** e depois salve. Editar apenas o nome/identificador mantém a imagem atual.

## Implementação

- `categories.image_url` é texto opcional. O campo foi autorizado pela usuária e adicionado pelo Table Editor do projeto Supabase existente em 11/11/2026. O SQL equivalente e idempotente está em `supabase/migrations/20261111_category_cover.sql`.
- Os seis registros foram copiados antes da alteração. A comparação após adicionar o campo confirmou que todos os valores antigos foram preservados.
- Upload usa o bucket público `categories`, já existente, com nomes únicos em `covers/`. Arquivos antigos nunca são sobrescritos ou excluídos ao trocar/remover uma capa.
- As ações de salvar exigem a sessão administrativa validada no servidor. Tamanho, MIME e assinatura JPG/PNG/WebP são verificados antes do upload.
- O servidor aceita corpo de até 4 MB para comportar a imagem de 3 MB e o formulário. O arquivo continua limitado a 3 MB.
- A loja prioriza a URL salva em cada categoria. O fallback depende da identidade da categoria, nunca da sua posição. Óculos sem capa personalizada usa um ícone de óculos.
- Nenhuma política RLS ou permissão de Storage foi alterada nesta implementação.

## Validação

TypeScript e builds de produção verificados em ambos os projetos. Os 47 testes automatizados incluem upload válido, preservação/remoção da capa, falha de Storage, conteúdo inválido, tamanho máximo, autorização e categorias reordenadas. O resultado do teste integrado real é registrado no relatório de entrega da sessão.

As alterações são destinadas inicialmente à branch de homologação. Publicação de produção permanece sujeita à aprovação da usuária.
