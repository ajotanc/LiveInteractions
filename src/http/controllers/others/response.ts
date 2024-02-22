import { FastifyRequest, FastifyReply } from "fastify";
import { CheerioAPI, Element } from "cheerio";
import { z } from "zod";
import { extractData } from "../../../helpers";
import { ColumnOthers, ParametersOthers } from "../../../interfaces";

/**
 * Get response from the given URL.
 * @param request - The request object.
 * @param reply - The reply object.
 * @returns Promise<Array<unknown>> - The response data.
 */
export async function getResponse(
  request: FastifyRequest<{ Params: { url: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const othersParamsSchema = z.object({
    url: z.string(),
  });

  const { url } = othersParamsSchema.parse(request.params);
  const $ = await extractData(decodeURIComponent(url));

  const dados: Array<unknown> = [];
  const elements = $("h3.title, h4.subtitle, table.resumo, table.completo");

  let parameters = {
    events: {
      summary: [],
      records: [],
    },
    url,
  } as ParametersOthers;

  elements.each((index, element) => {
    if ($(element).is("h3.title")) {
      const [id] = $(element).text().split(" - ");
      parameters = {
        ...parameters,
        id,
        title: $(element).text().trim(),
      };
    }

    if ($(element).is("h4.subtitle")) {
      parameters = {
        ...parameters,
        subtitle: $(element).text().trim(),
      };
    }

    if ($(element).is("table.resumo")) {
      const columns = createColumns($, element, url, 0, 3, 1, "R");
      parameters.events.summary = columns;
    }

    if ($(element).is("table.completo")) {
      const columns = createColumns($, element, url, 1, 8, 2, "C");
      parameters.events.records = columns;
    }

    if ((index + 1) % 4 === 0) {
      dados.push(parameters);
      parameters = {
        events: {
          summary: [],
          records: [],
        },
        url,
      };
    }
  });

  reply.send(dados);
}

function createColumns(
  element: CheerioAPI,
  table: Element,
  url: string,
  nameNumber: number,
  descriptionNumber: number,
  fatherNumber: number,
  type: string,
): ColumnOthers[] {
  const columns = [] as ColumnOthers[];

  const AllRows = element(table).find("tr").not("tr:first");
  const rows = type === "R" ? AllRows.not(":first") : AllRows;

  rows.each((_, table) => {
    const column = element(table).find("td");

    const group = column.eq(nameNumber).text().trim();
    const urlGroup = column.eq(nameNumber).find("a").attr("href") || false;

    const description = column
      .eq(descriptionNumber)
      .text()
      .trim()
      .replace(/\n/g, " ");

    const father = column.eq(fatherNumber).text().trim() || false;
    const urlFather = column.eq(fatherNumber).find("a").attr("href") || false;

    if (group && !group.includes("...")) {
      columns.push({
        group,
        urlGroup: urlGroup ? decodeURIComponent(`${url}${urlGroup}`) : false,
        description,
        father,
        urlFather: urlFather ? decodeURIComponent(`${url}${urlFather}`) : false,
      });
    }
  });

  return columns;
}
