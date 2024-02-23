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
    id: z.string().optional(),
  });

  const { id, url } = othersParamsSchema.parse(request.params);
  const $ = await extractData(decodeURIComponent(url));

  const data: Array<ParametersOthers> = [];
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
        name: $(element).text().trim(),
      };
    }

    if ($(element).is("h4.subtitle")) {
      parameters = {
        ...parameters,
        description: $(element).text().trim(),
      };
    }

    if ($(element).is("table.resumo")) {
      const columns = createColumns($, element, url, 0, 3, 1, 4, 6, "R");
      parameters.events.summary = columns;
    }

    if ($(element).is("table.completo")) {
      const columns = createColumns($, element, url, 1, 8, 2, 5, 9999, "C");
      parameters.events.records = columns;
    }

    if ((index + 1) % 4 === 0) {
      data.push(parameters);
      parameters = {
        events: {
          summary: [],
          records: [],
        },
        url,
      };
    }
  });

  const response = id ? data.find((element) => element.id === id) : data;
  reply.send(response);
}

function createColumns(
  cheeiro: CheerioAPI,
  element: Element,
  url: string,
  nameNumber: number,
  descriptionNumber: number,
  fatherNumber: number,
  requiredNumber: number,
  conditionNumber: number,
  type: string,
): ColumnOthers[] {
  const columns = [] as ColumnOthers[];

  const AllRows = cheeiro(element).find("tr").not("tr:first");
  const rows = type === "R" ? AllRows.not(":first") : AllRows;

  rows.each((_, element) => {
    const column = cheeiro(element).find("td");

    const group = column.eq(nameNumber).text().trim();
    const urlGroup = column.eq(nameNumber).find("a").attr("href") || false;

    const description = column
      .eq(descriptionNumber)
      .text()
      .trim()
      .replace(/\n/g, "<br>");

    const required = column.eq(requiredNumber).text().trim();
    const condition = column
      .eq(conditionNumber)
      .text()
      .trim()
      .replace(/\n/g, "<br>");

    const father = column.eq(fatherNumber).text().trim() || false;
    const urlFather = column.eq(fatherNumber).find("a").attr("href") || false;

    if (group && !group.includes("...")) {
      columns.push({
        group,
        urlGroup: urlGroup ? decodeURIComponent(`${url}${urlGroup}`) : false,
        description,
        father,
        urlFather: urlFather ? decodeURIComponent(`${url}${urlFather}`) : false,
        required: required === "1",
        condition,
      });
    }
  });

  return columns;
}
