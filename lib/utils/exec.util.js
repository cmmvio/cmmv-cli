export const run = async (bin, args, opts = {}, awaitProcess = false) => {
    const { execa } = await import('execa');

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
            await execa(bin, args, {
                stdio: 'inherit',
                forceKillAfterDelay: false,
                ...opts
            });
        }
    } catch {  }
};
