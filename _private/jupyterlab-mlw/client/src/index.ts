// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  Menu
} from '@phosphor/widgets';

import {
  ICommandPalette
} from '@jupyterlab/apputils';

import {
  JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import {
  ServerConnection
} from '@jupyterlab/services';

import { URLExt } from '@jupyterlab/coreutils';

/*
import {
  PageConfig, URLExt
} from '@jupyterlab/coreutils';
*/

import {
  IMainMenu
} from '@jupyterlab/mainmenu';

/**
 * The command IDs used by the plugin.
 */
export
namespace CommandIDs {
  export
  const saveWorkspace: string = 'mlw:save-workspace';

  export
  const saveWorkspaceAs: string = 'mlw:save-workspace-as';
};

function HTTP_mlw_request(URL,METHOD,REQUEST):Promise<Response>{
  let request = {
    method: METHOD,
    body: JSON.stringify(REQUEST),
  };

  let setting = ServerConnection.makeSettings();
  let url = URLExt.join(setting.baseUrl, URL);
  return ServerConnection.makeRequest(url, request, setting);
}

async function mlw_save_workspace() {
  try {
    var val = await HTTP_mlw_request('/mlw/save_workspace','POST',{});
    if (val.status !== 200) {
      console.log (val);
      console.log (val.status);
      return val.text().then(data=>{
        throw new ServerConnection.ResponseError(val, data);
      });
    }
    var obj=await val.json();
    console.log (obj);
    if (!obj.success) {
      alert('Error saving workspace: '+obj.error)
      return;
    }
    alert('Workspace has been saved.');
    console.log (obj.output);
  }
  catch(err){
    throw ServerConnection.NetworkError;
  }
}

/**
 * Activate the jupyterlab extension.
 */
function activateExtension(app: JupyterLab, palette: ICommandPalette, mainMenu: IMainMenu): void {
  const category = 'MLWorkspace';
  const { commands } = app;

  commands.addCommand(CommandIDs.saveWorkspace, {
    label: 'Save workspace...',
    caption: 'Save changes to this MountainLab workspace...',
    execute: () => {
      console.log('test');
      
      mlw_save_workspace();
    }
  });

  commands.addCommand(CommandIDs.saveWorkspaceAs, {
    label: 'Save workspace as...',
    caption: 'Save changes to this MountainLab workspace as...',
    execute: () => {
      console.log('test2');
      alert('Not yet implemented.');
    }
  });

  // Add commands and menu itmes.
  let menu = new Menu({ commands });
  menu.title.label = category;
  [
    CommandIDs.saveWorkspace,
    CommandIDs.saveWorkspaceAs,
  ].forEach(command => {
    palette.addItem({ command, category });
    menu.addItem({ command });
  });
  mainMenu.addMenu(menu, {rank: 100});
  console.log('initialized jupyterlab-mlw');
}


/**
 * Initialization data for the jupyterlab extension.
 */
const Extension: JupyterLabPlugin<void> = {
  activate: activateExtension,
  id: 'jupyter.extensions.jupyterlab-mlw',
  requires: [
    ICommandPalette,
    IMainMenu,
  ],
  autoStart: true,
};

export default Extension;

