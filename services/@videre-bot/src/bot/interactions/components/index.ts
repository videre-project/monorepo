/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import {
  ActionRowBuilder,
  AnyComponentBuilder,
  ButtonBuilder,
  ChannelSelectMenuBuilder,
  MentionableSelectMenuBuilder,
  RoleSelectMenuBuilder,
  StringSelectMenuBuilder,
  UserSelectMenuBuilder,
  TextInputBuilder
} from '@discordjs/builders';


type Component = Button | SelectMenu | TextInput;

export type SelectMenu =
  ChannelSelectMenu |
  MentionableSelectMenu |
  RoleSelectMenu |
  StringSelectMenu |
  UserSelectMenu;

export class ActionRow extends ActionRowBuilder<AnyComponentBuilder> {
  constructor(...builders: AnyComponentBuilder[]){
    super({ components: builders.map(c => (c satisfies Component)?.toJSON()) });
  }
}

// #region Message Components

export class Button extends ButtonBuilder { }

export class ChannelSelectMenu extends ChannelSelectMenuBuilder { }

export class MentionableSelectMenu extends MentionableSelectMenuBuilder { }

export class RoleSelectMenu extends RoleSelectMenuBuilder { }

export class StringSelectMenu extends StringSelectMenuBuilder { }

export class UserSelectMenu extends UserSelectMenuBuilder { }

// #endregion

// #region Modal Components

export class TextInput extends TextInputBuilder { }

// #endregion

// TODO: Handle component localizations

export default [];
