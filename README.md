# RunescapeBot

Um agente feito para jogar RuneScape.

## Arquitetura

O projeto usa a livraria [rs-sdk](https://github.com/MaxBittker/rs-sdk), feita para benchmarking de agentes de IA. No nosso caso de uso, a IA não foi responsável por criar o bot, mas sim por agir como o bot.

O principal arquivo de script eh o bot [RunescapeBot](./rs-sdk/bots/RunescapeBot/script.ts), presente na pasta de bots da livraria.
Nesse script são definidas todas as tools que o agente pode usar para observar seu ambiente e agir sobre ele, tal qual algumas constantes de configuração como:

```ts
const TOTAL_ITERATIONS = 20;
const TIMEOUT_PER_ITERATION_SECS = 60;

const llm = groq.languageModel("llama-3.1-8b-instant");
```

O agente roda em loop, até atingir o máximo de iterações, e espera o tempo de timeout entre as iterações para evitar atingir o limite de requisitos ou tokens dado os altos requisitos da tarefa. A cada iteração o agente pode usar uma ou mais tools para observar seu ambiente ou efetuar ações dentro dele. Esse loop está presente no fim do arquivo, na função `runScript`.

## Dependencias

O projeto tem as seguintes dependências:

- [bun](https://bun.com)
- JRE 17 ( ou JDK 17)

## Como Rodar

Crie na pasta [RunescapeBot](./rs-sdk/bots/RunescapeBot/) um arquivo com o nome `API_KEY.env` que contém apenas uma chave de API do [GroqCloud](https://groq.com/).
ex:

```
xas_aksjdkajsdkljaskld…
```

Além disso, mantenha um browser aberto, ele será usado como cliente para o servidor.

Em seguida, instale todas as dependências de javascript:

```sh
cd ./rs-sdk/ && bun install
cd ./rs-sdk/server/engine && bun install
cd ./rs-sdk/server/webclient && bun install
cd ./rs-sdk/server/gateway && bun install
```

E rode, em shells/terminais separados, o servidor, webclient, gateway e, por final, o bot.

```sh
cd ./rs-sdk/server/engine && bun run start # servidor
cd ./rs-sdk/server/webclient && bun run watch # webclient
cd ./rs-sdk/server/gateway  && bun run gateway # gateway
cd ./rs-sdk/bots/RunescapeBot && bun script.ts # bot
```

Sempre rode o bot por último, após ter certeza que todos os outros servicos já terminaram de carregar.

## Distribuição de Tarefas / Autores

Guilherme Lompa John ( principal responsável por programação )
Lucca Rosal Lima Costa ( principal responsável pela criação e refinação dos prompts )
Davi Tomasini ( principal responsável pela documentação e parcialmente pela refinação dos prompts )
