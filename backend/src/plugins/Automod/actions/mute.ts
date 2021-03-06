import * as t from "io-ts";
import { automodAction } from "../helpers";
import { LogType } from "../../../data/LogType";
import {
  asyncMap,
  convertDelayStringToMS,
  nonNullish,
  resolveMember,
  tDelayString,
  tNullable,
  unique,
} from "../../../utils";
import { resolveActionContactMethods } from "../functions/resolveActionContactMethods";
import { ModActionsPlugin } from "../../ModActions/ModActionsPlugin";
import { MutesPlugin } from "../../Mutes/MutesPlugin";
import { ERRORS, RecoverablePluginError } from "../../../RecoverablePluginError";
import { LogsPlugin } from "../../Logs/LogsPlugin";

export const MuteAction = automodAction({
  configType: t.type({
    reason: tNullable(t.string),
    duration: tNullable(tDelayString),
    notify: tNullable(t.string),
    notifyChannel: tNullable(t.string),
  }),

  defaultConfig: {
    notify: null, // Use defaults from ModActions
  },

  async apply({ pluginData, contexts, actionConfig, ruleName, matchResult }) {
    const duration = actionConfig.duration ? convertDelayStringToMS(actionConfig.duration)! : undefined;
    const reason = actionConfig.reason || "Muted automatically";
    const contactMethods = resolveActionContactMethods(pluginData, actionConfig);

    const caseArgs = {
      modId: pluginData.client.user.id,
      extraNotes: matchResult.fullSummary ? [matchResult.fullSummary] : [],
    };

    const userIdsToMute = unique(contexts.map(c => c.user?.id).filter(nonNullish));

    const mutes = pluginData.getPlugin(MutesPlugin);
    for (const userId of userIdsToMute) {
      try {
        await mutes.muteUser(userId, duration, reason, { contactMethods, caseArgs });
      } catch (e) {
        if (e instanceof RecoverablePluginError && e.code === ERRORS.NO_MUTE_ROLE_IN_CONFIG) {
          pluginData.getPlugin(LogsPlugin).log(LogType.BOT_ALERT, {
            body: `Failed to mute <@!${userId}> in Automod rule \`${ruleName}\` because a mute role has not been specified in server config`,
          });
        } else {
          throw e;
        }
      }
    }
  },
});
