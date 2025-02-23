export const run = async (bin, args, opts = {}) => {
    const { execa } = await import('execa');

    try {
        const subprocess = execa(bin, args, {
            stdio: 'inherit',
            forceKillAfterDelay: false,
            ...opts
        });

        subprocess.catch((err) => {
            if (err.isCanceled) return;
        });

        return subprocess.pid;
    } catch {  }
};
