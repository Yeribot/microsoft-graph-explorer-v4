import { IDropdownOption } from 'office-ui-fabric-react';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { IQuery, IQueryRunnerProps, IQueryRunnerState } from '../../../types/query-runner';
import * as queryActionCreators from '../../services/actions/query-action-creators';
import './query-runner.scss';
import { QueryInputControl } from './QueryInput';
import { Request } from './request/Request';

export class QueryRunner extends Component<IQueryRunnerProps, IQueryRunnerState> {
  constructor(props: any) {
    super(props);
    this.state = {
      httpMethods: [
        { key: 'GET', text: 'GET' },
        { key: 'POST', text: 'POST' },
        { key: 'PUT', text: 'PUT' },
        { key: 'PATCH', text: 'PATCH' },
        { key: 'DELETE', text: 'DELETE' },
      ],
      selectedVerb: 'GET',
      sampleURL: 'https://graph.microsoft.com/v1.0/me/',
      sampleBody: undefined,
      headers: [{ name: '', value: '' }],
      headerName: '',
      headerValue: '',
    };
  }

  private handleOnMethodChange = (option?: IDropdownOption) => {
    if (option !== undefined) {
      this.setState({ selectedVerb: option.text });
    }
  };

  private handleOnUrlChange = (newQuery?: string) => {
    if (newQuery) {
      this.setState({ sampleURL: newQuery });
    }
  };

  private handleOnEditorChange = (body?: string) => {
    if (body) {
      this.setState({ sampleBody: body });
    }
  };

  private handleOnHeaderNameChange = (name?: any) => {
    if (name) {
      this.setState({
        headerName: name,
      });
    }
  };

  private handleOnHeaderValueChange = (value?: any) => {
    if (value) {
      this.setState({
        headerValue: value,
      });
    }
  };

  private handleOnHeaderDelete = (headerIndex: any) => {
    const { headers } = this.state;
    const headersToDelete = [...headers];
    headersToDelete.splice(headerIndex, 1);
    this.setState({
      headers: headersToDelete,
    });
    const listOfHeaders = headers;
    if (listOfHeaders.length === 0) {
      listOfHeaders.push({ name: '', value: '' });
    }
    this.setState({
      headers: listOfHeaders,
    });
  };

  private handleOnHeaderValueBlur = () => {
    if (this.state.headerName !== '') {
      const { headerName, headerValue, headers } = this.state;
      const header = { name: headerName, value: headerValue };
      const newHeaders = [header, ...headers];
      this.setState({
        headers: newHeaders,
        headerName: '',
        headerValue: '',
      });
    }
  };

  public getLastHeader() {
    const headersLength = this.state.headers.length;
    return this.state.headers[headersLength - 1];
    }

  private handleOnRunQuery = () => {
    const { sampleURL, selectedVerb, sampleBody } = this.state;
    const { actions } = this.props;

    const query: IQuery = {
      sampleURL,
      selectedVerb,
      sampleBody,
    };

    if (actions) {
      actions.runQuery(query);
    }
  };

  public render() {
    const {
      httpMethods,
      selectedVerb,
      sampleURL,
      headers,
    } = this.state;

    return (
      <div>
        <div className='row'>
          <div className='col-sm-12 col-lg-12'>
            <QueryInputControl
              handleOnRunQuery={this.handleOnRunQuery}
              handleOnMethodChange={this.handleOnMethodChange}
              handleOnUrlChange={this.handleOnUrlChange}
              httpMethods={httpMethods}
              selectedVerb={selectedVerb}
              sampleURL={sampleURL}
            />
          </div>
        </div>
        <div className='row'>
          <div className='col-sm-12 col-lg-12'>
            <Request
              handleOnEditorChange={this.handleOnEditorChange}
              handleOnHeaderDelete={this.handleOnHeaderDelete}
              handleOnHeaderNameChange={this.handleOnHeaderNameChange}
              handleOnHeaderValueChange={this.handleOnHeaderValueChange}
              handleOnHeaderValueBlur={this.handleOnHeaderValueBlur}
              headers={headers}
            />
          </div>
        </div>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch: Dispatch): object {
  return {
    actions: bindActionCreators(queryActionCreators, dispatch),
  };
}

export default connect(null, mapDispatchToProps)(QueryRunner);
