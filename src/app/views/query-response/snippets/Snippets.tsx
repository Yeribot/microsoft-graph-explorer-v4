import { Pivot } from '@fluentui/react';
import React from 'react';

import { componentNames, telemetry } from '../../../../telemetry';
import { renderSnippets } from './snippets-helper';

function GetSnippets() {
  const supportedLanguages = ['CSharp', 'JavaScript', 'Java', 'Objective-C'];

  return (
    <Pivot className="code-snippet-body">
      {renderSnippets(supportedLanguages)}
    </Pivot>
  );
}
export const Snippets = telemetry.trackReactComponent(GetSnippets, componentNames.CODE_SNIPPETS_TAB);
