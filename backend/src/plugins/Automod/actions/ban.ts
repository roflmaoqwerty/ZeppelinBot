import * as t from "io-ts";
import { automodAction } from "../helpers";
import { LogType } from "../../../data/LogType";
import { asyncMap, nonNullish, resolveMember, tNullable, unique } from "../../../utils";
import { resolveActionContactMethods } from "../functions/resolveActionContactMethods";
import { ModActionsPlugin } from "../../ModActions/ModActionsPlugin";

export const BanAction = automodAction({
  configType: t.type({
    reason: tNullable(t.string),
    notify: tNullable(t.string),
    notifyChannel: tNullable(t.string),
    deleteMessageDays: tNullable(t.number),
  }),

  defaultConfig: {
    notify: null, // Use defaults from ModActions
  },

  async apply({ pluginData, contexts, actionConfig, matchResult }) {
    const reason = actionConfig.reason || "Kicked automatically";
    const contactMethods = resolveActionContactMethods(pluginData, actionConfig);
    const deleteMessageDays = actionConfig.deleteMessageDays || undefined;

    const caseArgs = {
      modId: pluginData.client.user.id,
      extraNotes: matchResult.fullSummary ? [matchResult.fullSummary] : [],
    };

    const userIdsToBan = unique(contexts.map(c => c.user?.id).filter(nonNullish));

    const modActions = pluginData.getPlugin(ModActionsPlugin);
    for (const userId of userIdsToBan) {
      await modActions.banUserId(userId, reason, { contactMethods, caseArgs, deleteMessageDays });
    }
  },
});
