import { FastifyRequest, FastifyReply } from "fastify";
import { CheerioAPI, Element } from "cheerio";
import { z } from "zod";
import { extractData } from "../../../helpers";
import { env } from "../../../env";
import {
  ColumnOthers,
  Parameters,
  ParametersOthers,
} from "../../../interfaces";

/**
 * Get response from the given URL.
 * @param request - The request object.
 * @param reply - The reply object.
 * @returns Promise<Array<unknown>> - The response data.
 */
export async function dictionary(
  request: FastifyRequest<{ Params: { url: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const url = await getUrl();

  const $ = await extractData(url);

  const menu = $(".navbar-start .has-dropdown");
  const version = $(".container h1.title").text().trim();
  const comments = $(".is-hidden-print h2.title:last")
    .html()
    .replace(/Observaç[ãõ][oe]s?: /g, "");

  const data: Parameters = {
    version,
    comments,
    url,
    menu: [],
  } as Parameters;

  menu.each((_, item) => {
    const group = $(item).find(".navbar-link").text().trim();
    const options = $(item).find(".navbar-dropdown .navbar-item");

    const menuItem = { group, options: [] };

    options.each((_, option) => {
      const text = $(option).text().trim();
      const [value] = text.split(" - ");
      menuItem.options.push({ text, value });
    });

    data.menu.push(menuItem);
  });

  reply.send(data);
}

export async function dictionaryById(
  request: FastifyRequest<{ Params: { url: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const othersParamsSchema = z.object({
    id: z.string().optional(),
  });

  const url = await getUrl();

  const { id } = othersParamsSchema.parse(request.params);
  const $ = await extractData(url);

  const elements = $("h3.title, h4.subtitle, table.resumo, table.completo");

  const data: Array<ParametersOthers> = [];

  let parameters = {
    events: {
      summary: [],
      records: [],
    },
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
      };
    }
  });

  const response = id
    ? data.find((element) => element.id === id.toUpperCase())
    : data;
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

async function getUrl(): Promise<string> {
  const url = env.URL_DOC_ESOCIAL;

  const $ = await extractData(url);

  const elements = $("#content .outstanding-link");
  const date = new Date();

  const links = [];

  elements.each((_, element) => {
    const link = $(element).attr("href").trim();
    links.push(link);
  });

  const response = links.find(
    (link) =>
      link.includes(date.getFullYear().toString()) && link.endsWith(".html"),
  );

  return response;
}
