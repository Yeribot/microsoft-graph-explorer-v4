import {
  ChoiceGroup,
  DefaultButton,
  Dialog,
  DialogFooter,
  DialogType,
  DocumentCard,
  DocumentCardActivity,
  DocumentCardDetails,
  DocumentCardTitle,
  DropdownMenuItemType,
  getId,
  getTheme,
  Icon,
  IconButton,
  IDocumentCardStyles,
  ITheme,
  Label,
  List,
  Panel,
  PanelType,
  PrimaryButton,
  TooltipHost
} from '@fluentui/react';
import React, { useEffect, useState } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';

import '../../utils/string-operations';
import { geLocale } from '../../../appLocale';
import { componentNames, eventTypes, telemetry } from '../../../telemetry';
import { loadGETheme } from '../../../themes';
import { AppTheme } from '../../../types/enums';
import { IRootState } from '../../../types/root';
import { ISettingsProps } from '../../../types/settings';
import { signOut } from '../../services/actions/auth-action-creators';
import { consentToScopes } from '../../services/actions/permissions-action-creator';
import { togglePermissionsPanel } from '../../services/actions/permissions-panel-action-creator';
import { changeTheme } from '../../services/actions/theme-action-creator';
import { Permission } from '../query-runner/request/permissions';
import { toggleTourState } from '../../services/actions/tour-action-creator';
import { advancedFeaturesList, beginnerFeaturesList } from '../tour/utils/itemsFeatured'

function Settings(props: ISettingsProps) {
  const dispatch = useDispatch();
  const {
    permissionsPanelOpen,
    authToken,
    theme: appTheme
  } = useSelector((state: IRootState) => state);
  const authenticated = authToken.token;
  const [themeChooserDialogHidden, hideThemeChooserDialog] = useState(true);
  const [items, setItems] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [tourChooserDialogHidden, hideTourChooserDialog] = useState(true);
  const [tourChooserCard, hideTourChooserCard] = useState(true);

  const currentTheme: ITheme = getTheme();
  const {
    intl: { messages }
  }: any = props;

  useEffect(() => {
    const menuItems: any = [
      {
        key: 'office-dev-program',
        text: messages['Office Dev Program'],
        href: `https://developer.microsoft.com/${geLocale}/office/dev-program`,
        target: '_blank',
        iconProps: {
          iconName: 'CommandPrompt'
        },
        onClick: () => trackOfficeDevProgramLinkClickEvent()
      },
      {
        key: 'report-issue',
        text: messages['Report an Issue'],
        href: 'https://github.com/microsoftgraph/microsoft-graph-explorer-v4/issues/new/choose',
        target: '_blank',
        iconProps: {
          iconName: 'ReportWarning'
        },
        onClick: () => trackReportAnIssueLinkClickEvent()
      },
      {
        key: 'divider',
        text: '-',
        itemType: DropdownMenuItemType.Divider
      },
      {
        key: 'change-theme',
        text: messages['Change theme'],
        iconProps: {
          iconName: 'Color'
        },
        onClick: () => toggleThemeChooserDialogState()
      },
      {
        key: 'GE Tour',
        text: messages['GE Tour'],
        iconProps: {
          iconName: 'Vacation'
        },
        onClick: () => toggleTourCardState()
      }
    ];

    if (authenticated) {
      menuItems.push(
        {
          key: 'view-all-permissions',
          text: messages['view all permissions'],
          iconProps: {
            iconName: 'AzureKeyVault'
          },
          onClick: () => changePanelState()
        },
        {
          key: 'sign-out',
          text: messages['sign out'],
          iconProps: {
            iconName: 'SignOut'
          },
          onClick: () => handleSignOut()
        },
      );
    }
    setItems(menuItems);
  }, [authenticated]);

  const toggleCurrentTourState = (selectedTour : any) => {
    if(selectedTour !== '' && selectedTour === 'Advanced Tour'){
      dispatch(toggleTourState({runState: true, beginnerTour: false, continuous: true, startIndex: 0}));
    }
    else{
      dispatch(toggleTourState({runState: true, beginnerTour: true, continuous: true, startIndex: 0}));
    }
    toggleTourCardState();
  }

  const toggleThemeChooserDialogState = () => {
    let hidden = themeChooserDialogHidden;
    hidden = !hidden;
    hideThemeChooserDialog(hidden);
    telemetry.trackEvent(eventTypes.BUTTON_CLICK_EVENT, {
      ComponentName: componentNames.THEME_CHANGE_BUTTON
    });
  };

  const toggleTourCardState = () => {
    let tourCardHidden = tourChooserCard;
    tourCardHidden = !tourCardHidden;
    hideTourChooserCard(tourCardHidden);
  }

  const handleSignOut = () => {
    dispatch(signOut());
  };

  const handleChangeTheme = (selectedTheme: any) => {
    const newTheme: string = selectedTheme.key;
    dispatch(changeTheme(newTheme));
    loadGETheme(newTheme);
    telemetry.trackEvent(eventTypes.BUTTON_CLICK_EVENT, {
      ComponentName: componentNames.SELECT_THEME_BUTTON,
      SelectedTheme: selectedTheme.key.replace('-', ' ').toSentenceCase()
    });
  };

  const changePanelState = () => {
    let open = !!permissionsPanelOpen;
    open = !open;
    dispatch(togglePermissionsPanel(open));
    setSelectedPermissions([]);
    trackSelectPermissionsButtonClickEvent();
  };

  const trackSelectPermissionsButtonClickEvent = () => {
    telemetry.trackEvent(eventTypes.BUTTON_CLICK_EVENT, {
      ComponentName: componentNames.VIEW_ALL_PERMISSIONS_BUTTON
    });
  };

  const trackReportAnIssueLinkClickEvent = () => {
    telemetry.trackEvent(eventTypes.LINK_CLICK_EVENT, {
      ComponentName: componentNames.REPORT_AN_ISSUE_LINK
    });
  };

  const setPermissions = (permissions: []) => {
    setSelectedPermissions(permissions);
  };

  const handleConsent = () => {
    dispatch(consentToScopes(selectedPermissions));
    setSelectedPermissions([]);
  };

  const trackOfficeDevProgramLinkClickEvent = () => {
    telemetry.trackEvent(eventTypes.LINK_CLICK_EVENT, {
      ComponentName: componentNames.OFFICE_DEV_PROGRAM_LINK
    });
  };

  const getSelectionDetails = () => {
    const selectionCount = selectedPermissions.length;

    switch (selectionCount) {
      case 0:
        return '';
      case 1:
        return `1 ${messages.selected}: ` + selectedPermissions[0];
      default:
        return `${selectionCount} ${messages.selected}`;
    }
  };

  const onRenderFooterContent = () => {
    return (
      <div>
        <Label>{getSelectionDetails()}</Label>
        <PrimaryButton
          disabled={selectedPermissions.length === 0}
          onClick={() => handleConsent()}
          style={{ marginRight: 10 }}
        >
          <FormattedMessage id='Consent' />
        </PrimaryButton>
        <DefaultButton onClick={() => changePanelState()}>
          <FormattedMessage id='Cancel' />
        </DefaultButton>
      </div>
    );
  };

  const onRenderCell = (item: any, index: any) => {
    return(
      <div>
        <ListIcon/> {' '} {item.name}

      </div>
    )
  }

  const ListIcon = () => <Icon iconName="LocationDot"/>

  const menuProperties = {
    shouldFocusOnMount: true,
    alignTargetEdge: true,
    items
  };

  const cardStyles: IDocumentCardStyles = {
    root: { display: 'inline-block', marginRight: 20, marginBottom: 20, width: 320}
  };

  return (
    <div className='settings-menu-button'>
      <TooltipHost
        content={messages['More actions']}
        id={getId()}
        calloutProps={{ gapSpace: 0 }}
      >
        <IconButton
          ariaLabel={messages['More actions']}
          role='button'
          styles={{
            label: { marginBottom: -20 },
            menuIcon: { fontSize: 20 }
          }}
          menuIconProps={{ iconName: 'More' }}
          menuProps={menuProperties}
        />
      </TooltipHost>
      <div>
        <Dialog
          hidden={themeChooserDialogHidden}
          onDismiss={() => toggleThemeChooserDialogState()}
          dialogContentProps={{
            type: DialogType.normal,
            title: messages['Change theme'],
            isMultiline: false
          }}
        >
          <ChoiceGroup
            label='Pick one theme'
            defaultSelectedKey={appTheme}
            options={[
              {
                key: AppTheme.Light,
                iconProps: { iconName: 'Light' },
                text: messages.Light
              },
              {
                key: AppTheme.Dark,
                iconProps: { iconName: 'CircleFill' },
                text: messages.Dark
              },
              {
                key: AppTheme.HighContrast,
                iconProps: { iconName: 'Contrast' },
                text: messages['High Contrast']
              }
            ]}
            onChange={(event, selectedTheme) =>
              handleChangeTheme(selectedTheme)
            }
          />
          <DialogFooter>
            <DefaultButton
              text={messages.Close}
              onClick={() => toggleThemeChooserDialogState()}
            />
          </DialogFooter>
        </Dialog>

        <Dialog
          hidden={tourChooserCard}
          onDismiss={() => toggleTourCardState()}
          dialogContentProps={{
            title: messages['Tour Chooser'],
            styles: {title:{textAlign: 'center'}}
          }}
          minWidth={200}
          maxWidth={530}

        >
          <div style={{display: 'flex', textAlign: 'left'}} >
            <DocumentCard
              onClick = {() => toggleCurrentTourState('Beginner Tour')}
              styles={cardStyles}
              key='Beginner Tour'
            >
              <DocumentCardDetails>
                <DocumentCardTitle title={messages['Beginner Tour']} shouldTruncate />
                <span style={{padding:'1px', margin:'15px', lineHeight:''}}>
                  <FormattedMessage id="Beginner Tour Message" />
                </span>
                <List items={beginnerFeaturesList} style={{padding:'1px', margin:'15px', lineHeight:'1.5'}}
                  onRenderCell={onRenderCell} />
              </DocumentCardDetails>
            </DocumentCard>

            <DocumentCard
              styles={cardStyles}
              key = 'Advanced Tour'
              onClick = {() => toggleCurrentTourState('Advanced Tour')}
            >
              <DocumentCardDetails>
                <DocumentCardTitle title={messages['Advanced Tour']} />
                <span style={{padding:'1px', margin:'15px', lineHeight:''}}>
                  <FormattedMessage id="Advanced Tour Message" />
                </span>
                <List items={advancedFeaturesList} style={{padding:'1px', margin:'15px', lineHeight:'1.5'}}
                  onRenderCell={onRenderCell} />
              </DocumentCardDetails>
            </DocumentCard>
          </div>
        </Dialog>

        <Panel
          isOpen={permissionsPanelOpen}
          onDismiss={() => changePanelState()}
          type={PanelType.medium}
          hasCloseButton={true}
          headerText={messages.Permissions}
          onRenderFooterContent={onRenderFooterContent}
          isFooterAtBottom={true}
          closeButtonAriaLabel='Close'
          className='permissions-panel-body'
        >
          <Permission panel={true} setPermissions={setPermissions} />
        </Panel>

      </div>
    </div>
  );
}

export default injectIntl(Settings);

