const electron = require('electron');
const path = require('path');
const { app, BrowserWindow, Menu, dialog, ipcMain } = electron;

let mainWindow;
let addWindow;
let todoList = [];

app.on('ready', () => 
{
    mainWindow = new BrowserWindow({
        webPreferences: 
        {
            nodeIntegration: true
        }
    });
    mainWindow.setTitle('Project 2');
    mainWindow.setIcon(path.normalize(`${__dirname}/public/assets/images/logo/logo.png`));
    mainWindow.loadURL(path.normalize(`${__dirname}/index.html`));
    mainWindow.show();  
    setMainMenu(mainWindow);
});
ipcMain.on('addTodo', (event, todo) => 
{
    todoList.push(todo);
    mainWindow.webContents.send('sendTodo', todoList);
    addWindow.close();
    addWindow.on('closed', () => addWindow = null);
})
function setMainMenu(window)
{
    const mainMenu = Menu.buildFromTemplate(menuTemplate);
    window.setMenu(mainMenu);
}

function confirmation()
{
    const options = 
    {
        buttons: ["Yes","No"],
        message: "Do you really want to quit?"
    }
    return dialog.showMessageBox(options) === 0? true: false;
}
function createWindow(type, title)
{
    switch (type) 
    {
        case 'add':
            addWindow = new BrowserWindow({
                width: 300,
                height: 200,
                title: `Add ${title}`,
                webPreferences: 
                {
                    nodeIntegration: true
                }
            });
            setMainMenu(addWindow);
            addWindow.loadURL(path.resolve(`${__dirname}/page/${type}/${type}-${title}.html`));
            return addWindow;
        default:
            break;
    }
}
// each object is one dropdown, so for 5 menu options, we would create 5 different objects inside the array
const menuTemplate = [{
    label: 'File',
    submenu: [
        {
            label: 'New todo',
            click() 
            {
                createWindow('add', 'to-do');
            }
        }, 
        {
            label: 'Clear todo',
            click() 
            {
                clearTodo();
            }
        }, 
        {
            label: 'Quit',
            click() 
            {
                confirmation()? app.quit(): null
            },
            accelerator: process.platform === 'darwin'? 'Command+Q': 'Ctrl+Q'
        }
    ]
}];

function clearTodo()
{
    todoList = [];
    mainWindow.webContents.send('clearTodo', todoList);
}

// mac / linux / debian
if (process.platform === 'darwin')
{
    // adds to the top of menu
    menuTemplate.unshift({});
}
// debug tools
if (process.env.NODE_ENV !== 'production')
{
    menuTemplate.push({
        label: 'DEVELOPER!!!',
        submenu: [
            { role: 'reload' },
            {
            label: 'Dev tools',
            click(item, focusedWindow)
            {
                focusedWindow.toggleDevTools();
            },
            accelerator: process.platform === 'darwin'? 'Command+Alt+I': 'Ctrl+D' 
        }]
    })
}