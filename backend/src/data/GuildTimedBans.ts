import moment from "moment-timezone";
import { Ban } from "./entities/Ban";
import { BaseGuildRepository } from "./BaseGuildRepository";
import { getRepository, Repository, Brackets } from "typeorm";
import { promises } from "dns";

export class GuildTimedBans extends BaseGuildRepository {
  private timedBans: Repository<Ban>;

  constructor(guildId) {
    super(guildId);
    this.timedBans = getRepository(Ban);
  }

  async getExpiredBans(): Promise<Ban[]> {
    return this.timedBans
      .createQueryBuilder("timed_bans")
      .where("guild_id = :guild_id", { guild_id: this.guildId })
      .andWhere("expires_at IS NOT NULL")
      .andWhere("expires_at <= NOW()")
      .getMany();
  }

  async findExistingBanForUserId(userId: string): Promise<Ban> {
    return this.timedBans.findOne({
      where: {
        guild_id: this.guildId,
        user_id: userId,
      },
    });
  }

  async addTimedBan(userid, expiryTime): Promise<Ban> {
    if (expiryTime) {
      const expiresAt = moment()
        .add(expiryTime, "ms")
        .format("YYYY-MM-DD HH:mm:ss");
      const result = await this.timedBans.insert({
        guild_id: this.guildId,
        user_id: userid,
        expires_at: expiresAt,
      });
      return this.timedBans.findOne({ where: result.identifiers[0] });
    }
  }

  async updateExpiryTime(userId, newExpiryTime) {
    if (newExpiryTime) {
      const expiresAt = moment()
        .add(newExpiryTime, "ms")
        .format("YYYY-MM-DD HH:mm:ss");
      return this.timedBans.update(
        {
          guild_id: this.guildId,
          user_id: userId,
        },
        {
          expires_at: expiresAt,
        },
      );
    }
  }

  async getActiveTimedBans(): Promise<Ban[]> {
    return this.timedBans
      .createQueryBuilder("timed_bans")
      .where("guild_id = :guild_id", { guild_id: this.guildId })
      .andWhere(
        new Brackets(qb => {
          qb.where("expires_at > NOW()").orWhere("expires_at IS NULL");
        }),
      )
      .getMany();
  }

  async setCaseId(userId: string, caseId: number) {
    await this.timedBans.update(
      {
        guild_id: this.guildId,
        user_id: userId,
      },
      {
        case_id: caseId,
      },
    );
  }

  async clear(userId) {
    await this.timedBans.delete({
      guild_id: this.guildId,
      user_id: userId,
    });
  }
}
