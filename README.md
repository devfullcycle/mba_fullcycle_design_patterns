# Fechamento de Faturamento

Fechamento atômico das faturas de um período (`POST /close_invoicing`) e consulta das faturas fechadas (`GET /invoices`).

## Banco

PostgreSQL com usuário `postgres`, senha `123456` e privilégio de superusuário (para a extensão `uuid-ossp`).

```bash
psql -U postgres -c "drop database if exists app;"
psql -U postgres -c "create database app;"
psql -U postgres -d app -v ON_ERROR_STOP=1 -f create.sql
```

O script é reexecutável; se rodar com a API no ar, reinicie a API.

## API e testes

```bash
npm install
TZ=America/Sao_Paulo npx ts-node src/main.ts
TZ=America/Sao_Paulo npx jest
```

O `TZ` é obrigatório: as datas do seed e dos asserts são horários de São Paulo.

## Convenção do HttpServer

O callback de `HttpServer.on` recebe `(params, body, headers, query)`, sendo `query` a query string. Se o callback devolve uma `string`, a resposta é texto puro; caso contrário, JSON.

## Transação e prova de atomicidade

A transação vive na infraestrutura: `DatabaseConnection.transaction(work)`, implementada no `PgPromiseAdapter` com o `tx` do pg-promise, é usada por `InvoiceDatabaseRepository.replacePeriod`, que remove as faturas do período/regime e insere as novas numa única transação. O caso de uso `CloseInvoicing` conhece apenas a porta `InvoiceRepository`. Em `test/CloseInvoicing.test.ts`, após um fechamento válido (1 fatura de 500), um segundo fechamento gera um lote em que a primeira fatura (1000) é inserida e a segunda viola a foreign key de `id_contract`; o teste comprova que o fechamento falha e que o banco mantém apenas a fatura anterior de 500.
