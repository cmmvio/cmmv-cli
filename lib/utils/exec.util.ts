import { execa } from 'execa';

export const run = async (bin, args, opts = {}, awaitProcess = false) => {

    try {
        if(!awaitProcess){
            const subprocess = execa(bin, args, {
                stdio: 'inherit',
                forceKillAfterDelay: false,
                ...opts
            });

            subprocess.catch((err) => {
                if (err.isCanceled) return;
            });

            return subprocess.pid;
        }
        else{
            await execa(bin, args, { stdio: 'inherit', ...opts });
        }
    } catch {  }
};