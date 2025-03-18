const inquirer = require('inquirer');
const schedule = require('node-schedule');
const chalk = require('chalk');
const clear = require('clear');
const { exec, execSync } = require('child_process');
const path = require('path');

let commandHistory = [];

function showWelcome(language) {
    clear();
    if (language === 'pt') {
        console.log(chalk.green.bold('==========================='));
        console.log(chalk.green.bold(' Terminal Interativo Bonito'));
        console.log(chalk.green.bold('===========================\n'));
    } else {
        console.log(chalk.green.bold('==========================='));
        console.log(chalk.green.bold(' Interactive Terminal'));
        console.log(chalk.green.bold('===========================\n'));
    }
}

async function showMenu(language) {
    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'command',
            message: language === 'pt' ? 'Escolha uma opção:' : 'Choose an option:',
            choices: [
                language === 'pt' ? 'Terminal Interativo' : 'Interactive Terminal',
                language === 'pt' ? 'Agendar Comandos' : 'Schedule Commands',
                language === 'pt' ? 'Ver Status do Sistema' : 'View System Status',
                language === 'pt' ? 'Limpar Terminal' : 'Clear Terminal',
                language === 'pt' ? 'Histórico de Comandos' : 'Command History',
                language === 'pt' ? 'Fechar' : 'Close'
            ]
        }
    ]);
    handleCommand(answers.command, language);
}

function handleCommand(command, language) {
    switch (command) {
        case language === 'pt' ? 'Terminal Interativo' : 'Interactive Terminal':
            interactiveTerminal(language);
            break;
        case language === 'pt' ? 'Agendar Comandos' : 'Schedule Commands':
            scheduleCommands(language);
            break;
        case language === 'pt' ? 'Ver Status do Sistema' : 'View System Status':
            viewSystemStatus(language);
            break;
        case language === 'pt' ? 'Limpar Terminal' : 'Clear Terminal':
            clearTerminal();
            break;
        case language === 'pt' ? 'Histórico de Comandos' : 'Command History':
            showCommandHistory(language);
            break;
        case language === 'pt' ? 'Fechar' : 'Close':
            console.log(chalk.yellow(language === 'pt' ? 'Saindo...' : 'Exiting...'));
            process.exit();
            break;
        default:
            console.log(chalk.red('Comando inválido.'));
            showMenu(language);
            break;
    }
}

async function interactiveTerminal(language) {
    let currentDir = process.cwd();

    const promptCommand = async () => {
        const { command } = await inquirer.prompt([
            {
                type: 'input',
                name: 'command',
                message: `${chalk.blue(currentDir)} > ${language === 'pt' ? 'Digite o comando a ser executado:' : 'Enter the command to be executed:'}`,
            }
        ]);

        if (command.toLowerCase() === 'exit') {
            showMenu(language);
            return;
        }

        if (command.startsWith('cd ')) {
            const dir = command.slice(3).trim();
            try {
                process.chdir(dir);
                currentDir = process.cwd();
                console.log(chalk.green(`Diretório alterado para: ${currentDir}`));
            } catch (err) {
                console.error(chalk.red('Erro ao mudar o diretório:', err.message));
            }
        } else if (command.startsWith('mkdir ')) {
            const dirName = command.slice(6).trim();
            try {
                execSync(`mkdir ${dirName}`);
                console.log(chalk.green(`Diretório ${dirName} criado com sucesso!`));
            } catch (err) {
                console.error(chalk.red(`Erro ao criar o diretório: ${err.message}`));
            }
        } else if (command.startsWith('touch ')) {
            const fileName = command.slice(6).trim();
            try {
                execSync(`touch ${fileName}`);
                console.log(chalk.green(`Arquivo ${fileName} criado com sucesso!`));
            } catch (err) {
                console.error(chalk.red(`Erro ao criar o arquivo: ${err.message}`));
            }
        } else if (command === 'clear') {
            clearTerminal();
        } else {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(chalk.red(`Erro: ${error.message}`));
                }
                if (stderr) {
                    console.error(chalk.red(`Erro: ${stderr}`));
                }
                if (stdout) {
                    console.log(stdout);
                }
            });
        }

        commandHistory.push(command);
        promptCommand();
    };

    promptCommand();
}

function viewSystemStatus(language) {
    console.log(chalk.blue(language === 'pt' ? 'Verificando status do sistema...' : 'Checking system status...'));

    exec('top -n 1 | head -n 20', (error, stdout, stderr) => {
        if (error) {
            console.error(chalk.red(`Erro: ${error.message}`));
        }
        if (stderr) {
            console.error(chalk.red(`Erro: ${stderr}`));
        }
        if (stdout) {
            console.log(stdout);
        }
        showMenu(language);
    });
}

function clearTerminal() {
    clear();
    console.log(chalk.green('Terminal limpo!'));
    showMenu('en');
}

function showCommandHistory(language) {
    if (commandHistory.length === 0) {
        console.log(chalk.yellow(language === 'pt' ? 'Nenhum comando executado ainda.' : 'No commands executed yet.'));
    } else {
        console.log(chalk.green(language === 'pt' ? 'Histórico de Comandos:' : 'Command History:'));
        commandHistory.forEach((command, index) => {
            console.log(`${chalk.blue(index + 1)}: ${command}`);
        });
    }
    showMenu(language);
}

async function scheduleCommands(language) {
    const { command, time, unit } = await inquirer.prompt([
        {
            type: 'input',
            name: 'command',
            message: language === 'pt' ? 'Digite o comando a ser agendado:' : 'Enter the command to be scheduled:'
        },
        {
            type: 'input',
            name: 'time',
            message: language === 'pt' ? 'Digite o tempo (número):' : 'Enter the time (number):'
        },
        {
            type: 'list',
            name: 'unit',
            message: language === 'pt' ? 'Escolha a unidade de tempo:' : 'Choose the time unit:',
            choices: [
                language === 'pt' ? 'Minutos' : 'Minutes',
                language === 'pt' ? 'Segundos' : 'Seconds',
                language === 'pt' ? 'Horas' : 'Hours'
            ]
        }
    ]);

    const timeInMilliseconds = convertTimeToMilliseconds(time, unit);

    schedule.scheduleJob(Date.now() + timeInMilliseconds, function() {
        console.log(chalk.green(language === 'pt' ? 'Comando agendado executado:' : 'Scheduled command executed:'));
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Erro: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Erro: ${stderr}`);
                return;
            }
            console.log(stdout);
        });
    });

    console.log(chalk.yellow(language === 'pt' ? `Comando agendado para ${time} ${unit}` : `Command scheduled for ${time} ${unit}`));
    showMenu(language);
}

function convertTimeToMilliseconds(time, unit) {
    const timeNum = parseInt(time);
    switch (unit) {
        case 'Minutos':
        case 'Minutes':
            return timeNum * 60 * 1000;
        case 'Segundos':
        case 'Seconds':
            return timeNum * 1000;
        case 'Horas':
        case 'Hours':
            return timeNum * 60 * 60 * 1000;
        default:
            return 0;
    }
}

async function chooseLanguage() {
    const { language } = await inquirer.prompt([
        {
            type: 'list',
            name: 'language',
            message: 'Escolha o idioma / Choose the language:',
            choices: ['pt', 'en']
        }
    ]);

    showWelcome(language);
    showMenu(language);
}

chooseLanguage();
