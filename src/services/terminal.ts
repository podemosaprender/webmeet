/**
 * Let modules add commands to be invoked via terminal
 *
 * Modules can add {@link TCommandHandler} to {@link Commands}
 *
 * The CommandHandlers receive and can modify an {@link Env}
 *
 */

export const Env: Record<string, any>= {}
export type TEnv= typeof Env

export type TCommandHandler= (env: TEnv, cmdAndArgs: string[]) => Promise<string>|null
export const Commands: Record<string,TCommandHandler>= {}
 
/**
 * make DBG.Env and DBG.Commands available in the browser debug console
 */
declare global { interface Window { DBG: any; } }
window.DBG = window.DBG || {Env, Commands, cmd: handleCommand, _: {}};
import * as IOScreen from './io/screen/index'; //XXX: import ONLY needed functions
window.DBG._.IOScreen= IOScreen

Commands['help']= async () => Object.keys(Commands).join(' ');
Commands['clear']= () => null;
Commands['see']= async (env: TEnv, argv: string[]) => argv.length>1 ? env[argv[1]]+'' : Object.keys(Env).join(' ');;
Commands['set']= async (env: TEnv, argv: string[]) => {
	if (argv[2]==null) { delete env[argv[1]] }
	else { env[argv[1]]= argv[2]?.startsWith('$') ? env[argv[2].slice(1)] : argv[2]; }
	return 'ok'
};

export async function handleCommand(text: string) {
	const argsIndex= text.indexOf(' ');
	const argv= text.split(/\s+/);
	const command= argv[0];
	const handler= Commands[command]
	const response= handler!=null ? await handler(Env, argv) : 'Unknown command: ' + command;
	return response;
}
