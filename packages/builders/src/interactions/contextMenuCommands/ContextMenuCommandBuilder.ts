import type {
	ApplicationCommandType,
	Permissions,
	RESTPostAPIApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import {
	validateRequiredParameters,
	validateName,
	validateType,
	validateDefaultPermission,
	validateDefaultMemberPermission,
	validateDmPermission,
} from './Assertions';

export class ContextMenuCommandBuilder {
	/**
	 * The name of this context menu command
	 */
	public readonly name: string = undefined!;

	/**
	 * The type of this context menu command
	 */
	public readonly type: ContextMenuCommandType = undefined!;

	/**
	 * Whether the command is enabled by default when the app is added to a guild
	 *
	 * @deprecated This property is deprecated and will be removed in the future.
	 * You should use `setDefaultMemberPermissions` or `setDmEnabled` instead.
	 */
	public readonly default_permission: boolean | undefined = undefined;

	/**
	 * Set of permissions represented as a bit set for the command
	 */
	public readonly default_member_permissions: Permissions | null | undefined = undefined;

	/**
	 * Indicates whether the command is available in DMs with the application, only for globally-scoped commands.
	 * By default, commands are visible.
	 */
	public readonly dm_permission: boolean | null | undefined = undefined;

	/**
	 * Sets the name
	 *
	 * @param name The name
	 */
	public setName(name: string) {
		// Assert the name matches the conditions
		validateName(name);

		Reflect.set(this, 'name', name);

		return this;
	}

	/**
	 * Sets the type
	 *
	 * @param type The type
	 */
	public setType(type: ContextMenuCommandType) {
		// Assert the type is valid
		validateType(type);

		Reflect.set(this, 'type', type);

		return this;
	}

	/**
	 * Sets whether the command is enabled by default when the application is added to a guild.
	 *
	 * **Note**: If set to `false`, you will have to later `PUT` the permissions for this command.
	 *
	 * @param value Whether or not to enable this command by default
	 *
	 * @see https://discord.com/developers/docs/interactions/application-commands#permissions
	 * @deprecated Use `setDefaultMemberPermissions` and `setDMPermission` instead.
	 */
	public setDefaultPermission(value: boolean) {
		// Assert the value matches the conditions
		validateDefaultPermission(value);

		Reflect.set(this, 'default_permission', value);

		return this;
	}

	/**
	 * Sets the default permissions a member should have in order to run the command.
	 *
	 * **Note:** You can set this to `'0'` to disable the command by default.
	 *
	 * @param permissions The permissions bit field to set
	 *
	 * @see https://discord.com/developers/docs/interactions/application-commands#permissions
	 */
	public setDefaultMemberPermissions(permissions: Permissions | null | undefined) {
		// Assert the value and parse it
		const permissionValue = validateDefaultMemberPermission(permissions);

		Reflect.set(this, 'default_member_permissions', permissionValue);

		return this;
	}

	/**
	 * Sets if the command is available in DMs with the application, only for globally-scoped commands.
	 * By default, commands are visible.
	 *
	 * @param enabled If the command should be enabled in DMs
	 *
	 * @see https://discord.com/developers/docs/interactions/application-commands#permissions
	 */
	public setDMPermission(enabled: boolean | null | undefined) {
		// Assert the value matches the conditions
		validateDmPermission(enabled);

		Reflect.set(this, 'dm_permission', enabled);

		return this;
	}

	/**
	 * Returns the final data that should be sent to Discord.
	 *
	 * **Note:** Calling this function will validate required properties based on their conditions.
	 */
	public toJSON(): RESTPostAPIApplicationCommandsJSONBody {
		validateRequiredParameters(this.name, this.type);
		return { ...this };
	}
}

export type ContextMenuCommandType = ApplicationCommandType.User | ApplicationCommandType.Message;
