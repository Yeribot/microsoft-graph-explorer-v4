import React from 'react';
import { cleanup, render } from '@testing-library/react';
import ResponseDisplay from '../../app/views/query-response/response/ResponseDisplay';

afterEach(cleanup);
const renderResponseDisplay = (properties: any): any => {
  const {contentType, body, height} = properties;
  return render(
    <ResponseDisplay contentType={contentType} body={body} height={height}/>
  )
}

describe('Tests Response display of different formats', () => {
  it('Renders xml response type', ()=> {
    // Arrange
    const properties = {
      contentType: ['application/xml'],
      body: '<xml>test</xml>',
      height: 60
    }

    // Act
    renderResponseDisplay(properties);
  });

  it('Renders html response type', () => {
    // Arrange
    const properties = {
      contentType: ['text/html'],
      body: '<html>test</html>',
      height: 60
    }

    // Act
    renderResponseDisplay(properties);
  })
})