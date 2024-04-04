/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { EmbedBuilder } from '@discordjs/builders';

import type {
  ComponentEdgeContext,
  MessageOptions
} from 'slash-create/web';

import { hideText, unhideText } from '@/utils/formatters/text';
import Bindings, { type APIResponse, Query } from '@/bindings';
import { ErrorEmbed } from '@/responses';


export function setCallbackData(message: MessageOptions, data: Query) {
  const embed = message.embeds![0] as EmbedBuilder;
  embed.data.description = hideText(embed.data.description!, data.toString());
  message.embeds![0] = embed.toJSON();

  return message;
}

export async function getCallbackData<T = any>(ctx: ComponentEdgeContext): Promise<T[]> {
  const query = unhideText(ctx.message.embeds[0].description!);
  const res = await Bindings.API(query);
  if (!res.ok) ctx.send(ErrorEmbed(res));

  const { data } = (await res.json()) as APIResponse<T[]>;
  return data;
}
