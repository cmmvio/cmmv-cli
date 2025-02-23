export const run = async (bin, args, opts = {}) => {
    const chalk = (await import('chalk')).default;
    const { execa } = await import('execa');

    try {
        return execa(bin, args, { stdio: 'inherit', ...opts });
    } catch (err) {
        console.error(
            chalk.red(`Error running command: ${bin} ${args.join(' ')}`),
        );
        console.error(err.message);
        process.exit(1);
    }
};
