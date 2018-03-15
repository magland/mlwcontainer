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
  const saveChanges: string = 'mlw:save-changes';

  export
  const saveChangesAs: string = 'mlw:save-changes-as';
};


/**
 * Activate the jupyterlab extension.
 */
function activateExtension(app: JupyterLab, palette: ICommandPalette, mainMenu: IMainMenu): void {
  const category = 'MLWorkspace';
  const { commands } = app;

  commands.addCommand(CommandIDs.saveChanges, {
    label: 'Save changes...',
    caption: 'Save changes to this MountainLab workspace',
    execute: () => {
      console.log('test');
      let settings = ServerConnection.makeSettings();
      console.log(settings.baseUrl);
      //window.open(hubHost + URLExt.join(hubPrefix, 'home'), '_blank');
    }
  });

  commands.addCommand(CommandIDs.saveChangesAs, {
    label: 'Save changes as...',
    caption: 'Save changes to a different MountainLab workspace',
    execute: () => {
      console.log('test2');
    }
  });

  // Add commands and menu itmes.
  let menu = new Menu({ commands });
  menu.title.label = category;
  [
    CommandIDs.saveChanges,
    CommandIDs.saveChangesAs,
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

