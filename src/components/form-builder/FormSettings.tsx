"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Plus, Trash2, Link as LinkIcon, Mail, Phone, Globe, Settings, Bell } from 'lucide-react';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

interface FormSettingsProps {
  settings: any;
  onChange: (settings: any) => void;
  thankYouPage: any;
  onThankYouPageChange: (thankYouPage: any) => void;
  integrations: any[];
  onIntegrationsChange: (integrations: any[]) => void;
  notifications: any[];
  onNotificationsChange: (notifications: any[]) => void;
}

export default function FormSettings({
  settings,
  onChange,
  thankYouPage,
  onThankYouPageChange,
  integrations,
  onIntegrationsChange,
  notifications,
  onNotificationsChange
}: FormSettingsProps) {
  const [activeTab, setActiveTab] = useState('general');

  const updateSettings = (key: string, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  const updateThankYouPage = (key: string, value: any) => {
    onThankYouPageChange({ ...thankYouPage, [key]: value });
  };

  const addIntegration = (type: 'crm' | 'email' | 'webhook' | 'zapier' | 'whatsapp') => {
    const newIntegration = {
      type,
      enabled: true,
      config: {}
    };

    // Set default configurations based on type
    if (type === 'crm') {
      newIntegration.config = {
        createLead: true,
        pipeline: '',
        stage: '',
        assignTo: ''
      };
    } else if (type === 'email') {
      newIntegration.config = {
        recipient: '',
        subject: 'New form submission',
        replyTo: ''
      };
    } else if (type === 'webhook') {
      newIntegration.config = {
        url: '',
        method: 'POST',
        headers: {}
      };
    } else if (type === 'whatsapp') {
      newIntegration.config = {
        template: '',
        phoneField: ''
      };
    }

    onIntegrationsChange([...integrations, newIntegration]);
  };

  const updateIntegration = (index: number, key: string, value: any) => {
    const updatedIntegrations = [...integrations];
    updatedIntegrations[index] = {
      ...updatedIntegrations[index],
      [key]: value
    };
    onIntegrationsChange(updatedIntegrations);
  };

  const updateIntegrationConfig = (index: number, key: string, value: any) => {
    const updatedIntegrations = [...integrations];
    updatedIntegrations[index] = {
      ...updatedIntegrations[index],
      config: {
        ...updatedIntegrations[index].config,
        [key]: value
      }
    };
    onIntegrationsChange(updatedIntegrations);
  };

  const removeIntegration = (index: number) => {
    const updatedIntegrations = [...integrations];
    updatedIntegrations.splice(index, 1);
    onIntegrationsChange(updatedIntegrations);
  };

  const addNotification = (type: 'email' | 'whatsapp' | 'sms') => {
    const newNotification = {
      type,
      enabled: true,
      recipients: [''],
      template: type === 'email' ? 'Thank you for your submission' : '',
      subject: type === 'email' ? 'Form Submission Confirmation' : undefined
    };

    onNotificationsChange([...notifications, newNotification]);
  };

  const updateNotification = (index: number, key: string, value: any) => {
    const updatedNotifications = [...notifications];
    updatedNotifications[index] = {
      ...updatedNotifications[index],
      [key]: value
    };
    onNotificationsChange(updatedNotifications);
  };

  const updateNotificationRecipient = (notificationIndex: number, recipientIndex: number, value: string) => {
    const updatedNotifications = [...notifications];
    const recipients = [...updatedNotifications[notificationIndex].recipients];
    recipients[recipientIndex] = value;
    updatedNotifications[notificationIndex].recipients = recipients;
    onNotificationsChange(updatedNotifications);
  };

  const addRecipient = (notificationIndex: number) => {
    const updatedNotifications = [...notifications];
    updatedNotifications[notificationIndex].recipients.push('');
    onNotificationsChange(updatedNotifications);
  };

  const removeRecipient = (notificationIndex: number, recipientIndex: number) => {
    const updatedNotifications = [...notifications];
    const recipients = [...updatedNotifications[notificationIndex].recipients];
    recipients.splice(recipientIndex, 1);
    updatedNotifications[notificationIndex].recipients = recipients;
    onNotificationsChange(updatedNotifications);
  };

  const removeNotification = (index: number) => {
    const updatedNotifications = [...notifications];
    updatedNotifications.splice(index, 1);
    onNotificationsChange(updatedNotifications);
  };

  const renderGeneralSettings = () => (
    <div className="space-y-4">
      {/* <div className="flex items-center justify-between">
        <Label htmlFor="captcha">Enable CAPTCHA</Label>
        <Switch
          id="captcha"
          checked={settings.captcha}
          onCheckedChange={(checked) => updateSettings('captcha', checked)}
        />
      </div> */}

      <div className="flex items-center justify-between">
        <Label htmlFor="multi-page">Multi-page Form</Label>
        <Switch
          id="multi-page"
          checked={settings.multiPage}
          onCheckedChange={(checked) => updateSettings('multiPage', checked)}
        />
      </div>

      {settings.multiPage && (
        <div className="flex items-center justify-between">
          <Label htmlFor="progress-bar">Show Progress Bar</Label>
          <Switch
            id="progress-bar"
            checked={settings.progressBar}
            onCheckedChange={(checked) => updateSettings('progressBar', checked)}
          />
        </div>
      )}

      {/* <div className="flex items-center justify-between">
        <Label htmlFor="auto-save">
          <div>
            <span>Auto-save Responses</span>
            <p className="text-xs text-muted-foreground">Save partial responses as users progress</p>
          </div>
        </Label>
        <Switch
          id="auto-save"
          checked={settings.autoSave}
          onCheckedChange={(checked) => updateSettings('autoSave', checked)}
        />
      </div> */}

      <div className="flex items-center justify-between">
        <Label htmlFor="anonymous">
          <div>
            <span>Allow Anonymous Submissions</span>
            <p className="text-xs text-muted-foreground">Let users submit without an account</p>
          </div>
        </Label>
        <Switch
          id="anonymous"
          checked={settings.allowAnonymous}
          onCheckedChange={(checked) => updateSettings('allowAnonymous', checked)}
        />
      </div>

      {/* <div className="flex items-center justify-between">
        <Label htmlFor="require-login">
          <div>
            <span>Require Login</span>
            <p className="text-xs text-muted-foreground">Users must be logged in to submit</p>
          </div>
        </Label>
        <Switch
          id="require-login"
          checked={settings.requireLogin}
          onCheckedChange={(checked) => updateSettings('requireLogin', checked)}
        />
      </div> */}

      <div className="flex items-center justify-between">
        <Label htmlFor="confirmation-email">
          <div>
            <span>Send Confirmation Emails</span>
            <p className="text-xs text-muted-foreground">Email submitters a copy of their responses</p>
          </div>
        </Label>
        <Switch
          id="confirmation-email"
          checked={settings.confirmationEmail}
          onCheckedChange={(checked) => updateSettings('confirmationEmail', checked)}
        />
      </div>

      {/* <div>
        <Label htmlFor="limit-submissions">Limit Submissions</Label>
        <Input
          id="limit-submissions"
          type="number"
          min="0"
          placeholder="No limit"
          value={settings.limitSubmissions || ''}
          onChange={(e) => updateSettings('limitSubmissions', e.target.value ? Number(e.target.value) : null)}
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Leave empty for unlimited submissions
        </p>
      </div> */}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start-date">Start Date</Label>
          <Input
            id="start-date"
            type="datetime-local"
            value={settings.startDate || ''}
            onChange={(e) => updateSettings('startDate', e.target.value || null)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="end-date">End Date</Label>
          <Input
            id="end-date"
            type="datetime-local"
            value={settings.endDate || ''}
            onChange={(e) => updateSettings('endDate', e.target.value || null)}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );

  const renderThankYouPageSettings = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="thank-you-message">Thank You Message</Label>
        <Textarea
          id="thank-you-message"
          value={thankYouPage.message}
          onChange={(e) => updateThankYouPage('message', e.target.value)}
          placeholder="Thank you for your submission!"
          rows={4}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="redirect-url">Redirect URL (Optional)</Label>
        <Input
          id="redirect-url"
          type="url"
          value={thankYouPage.redirectUrl || ''}
          onChange={(e) => updateThankYouPage('redirectUrl', e.target.value)}
          placeholder="https://example.com/thank-you"
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Redirect users to this URL after form submission
        </p>
      </div>

      <div>
        <Label htmlFor="button-text">Button Text</Label>
        <Input
          id="button-text"
          value={thankYouPage.buttonText || ''}
          onChange={(e) => updateThankYouPage('buttonText', e.target.value)}
          placeholder="Back to Home"
          className="mt-1"
        />
      </div>

      {/* <div className="mt-6 p-4 border rounded-md bg-muted/30">
        <h3 className="text-sm font-medium mb-2">Preview</h3>
        <div className="p-4 border rounded-md bg-card text-center space-y-4">
          <h2 className="text-xl font-bold">
            {thankYouPage.message || "Thank you for your submission!"}
          </h2>
          {thankYouPage.redirectUrl && (
            <p className="text-sm text-muted-foreground">
              You will be redirected to another page shortly...
            </p>
          )}
          {thankYouPage.buttonText && (
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
              {thankYouPage.buttonText}
            </button>
          )}
        </div>
      </div> */}
    </div>
  );

//   const renderIntegrationsSettings = () => (
//     <div className="space-y-4">
//       <div className="flex flex-wrap gap-2 mb-4">
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={() => addIntegration('crm')}
//         >
//           <Globe className="h-4 w-4 mr-2" />
//           Add CRM
//         </Button>
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={() => addIntegration('email')}
//         >
//           <Mail className="h-4 w-4 mr-2" />
//           Add Email
//         </Button>
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={() => addIntegration('webhook')}
//         >
//           <LinkIcon className="h-4 w-4 mr-2" />
//           Add Webhook
//         </Button>
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={() => addIntegration('whatsapp')}
//         >
//           <Phone className="h-4 w-4 mr-2" />
//           Add WhatsApp
//         </Button>
//       </div>

//       {integrations.length === 0 ? (
//         <div className="text-center py-8 text-muted-foreground">
//           <Settings className="h-12 w-12 mx-auto mb-2 opacity-30" />
//           <h3 className="text-lg font-medium">No integrations configured</h3>
//           <p className="max-w-xs mx-auto mt-1">
//             Add integrations to automatically process form submissions
//           </p>
//         </div>
//       ) : (
//         <div className="space-y-4">
//           {integrations.map((integration, index) => (
//             <Card key={index} className="overflow-hidden">
//               <div className="bg-muted p-3 flex justify-between items-center">
//                 <div className="flex items-center">
//                   {integration.type === 'crm' && <Globe className="h-4 w-4 mr-2" />}
//                   {integration.type === 'email' && <Mail className="h-4 w-4 mr-2" />}
//                   {integration.type === 'webhook' && <LinkIcon className="h-4 w-4 mr-2" />}
//                   {integration.type === 'whatsapp' && <Phone className="h-4 w-4 mr-2" />}
//                   <span className="font-medium capitalize">{integration.type} Integration</span>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <Switch
//                     id={`integration-${index}-enabled`}
//                     checked={integration.enabled}
//                     onCheckedChange={(checked) => updateIntegration(index, 'enabled', checked)}
//                   />
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={() => removeIntegration(index)}
//                     className="h-8 w-8 p-0 text-destructive"
//                   >
//                     <Trash2 className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>
//               <CardContent className="p-4">
//                 {integration.type === 'crm' && (
//                   <div className="space-y-3">
//                     <div className="flex items-center justify-between">
//                       <Label htmlFor={`crm-create-lead-${index}`}>Create Lead</Label>
//                       <Switch
//                         id={`crm-create-lead-${index}`}
//                         checked={integration.config.createLead}
//                         onCheckedChange={(checked) => updateIntegrationConfig(index, 'createLead', checked)}
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor={`crm-pipeline-${index}`}>Pipeline</Label>
//                       <Input
//                         id={`crm-pipeline-${index}`}
//                         value={integration.config.pipeline || ''}
//                         onChange={(e) => updateIntegrationConfig(index, 'pipeline', e.target.value)}
//                         placeholder="Select pipeline"
//                         className="mt-1"
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor={`crm-stage-${index}`}>Stage</Label>
//                       <Input
//                         id={`crm-stage-${index}`}
//                         value={integration.config.stage || ''}
//                         onChange={(e) => updateIntegrationConfig(index, 'stage', e.target.value)}
//                         placeholder="Select stage"
//                         className="mt-1"
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor={`crm-assign-${index}`}>Assign To</Label>
//                       <Input
//                         id={`crm-assign-${index}`}
//                         value={integration.config.assignTo || ''}
//                         onChange={(e) => updateIntegrationConfig(index, 'assignTo', e.target.value)}
//                         placeholder="Select user"
//                         className="mt-1"
//                       />
//                     </div>
//                   </div>
//                 )}

//                 {integration.type === 'email' && (
//                   <div className="space-y-3">
//                     <div>
//                       <Label htmlFor={`email-recipient-${index}`}>Recipient Email</Label>
//                       <Input
//                         id={`email-recipient-${index}`}
//                         type="email"
//                         value={integration.config.recipient || ''}
//                         onChange={(e) => updateIntegrationConfig(index, 'recipient', e.target.value)}
//                         placeholder="email@example.com"
//                         className="mt-1"
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor={`email-subject-${index}`}>Subject</Label>
//                       <Input
//                         id={`email-subject-${index}`}
//                         value={integration.config.subject || ''}
//                         onChange={(e) => updateIntegrationConfig(index, 'subject', e.target.value)}
//                         placeholder="New form submission"
//                         className="mt-1"
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor={`email-reply-to-${index}`}>Reply-To Field</Label>
//                       <Input
//                         id={`email-reply-to-${index}`}
//                         value={integration.config.replyTo || ''}
//                         onChange={(e) => updateIntegrationConfig(index, 'replyTo', e.target.value)}
//                         placeholder="Select email field"
//                         className="mt-1"
//                       />
//                     </div>
//                   </div>
//                 )}

//                 {integration.type === 'webhook' && (
//                   <div className="space-y-3">
//                     <div>
//                       <Label htmlFor={`webhook-url-${index}`}>Webhook URL</Label>
//                       <Input
//                         id={`webhook-url-${index}`}
//                         type="url"
//                         value={integration.config.url || ''}
//                         onChange={(e) => updateIntegrationConfig(index, 'url', e.target.value)}
//                         placeholder="https://example.com/webhook"
//                         className="mt-1"
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor={`webhook-method-${index}`}>HTTP Method</Label>
//                       <select
//                         id={`webhook-method-${index}`}
//                         value={integration.config.method || 'POST'}
//                         onChange={(e) => updateIntegrationConfig(index, 'method', e.target.value)}
//                         className="block w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
//                       >
//                         <option value="POST">POST</option>
//                         <option value="PUT">PUT</option>
//                         <option value="PATCH">PATCH</option>
//                       </select>
//                     </div>
//                     <div>
//                       <Label htmlFor={`webhook-headers-${index}`}>Headers (JSON)</Label>
//                       <Textarea
//                         id={`webhook-headers-${index}`}
//                         value={
//                           typeof integration.config.headers === 'object'
//                             ? JSON.stringify(integration.config.headers, null, 2)
//                             : '{}'
//                         }
//                         onChange={(e) => {
//                           try {
//                             const headers = JSON.parse(e.target.value);
//                             updateIntegrationConfig(index, 'headers', headers);
//                           } catch (error) {
//                             // Handle invalid JSON
//                             console.error('Invalid JSON');
//                           }
//                         }}
//                         placeholder='{
//   "Content-Type": "application/json",
//   "Authorization": "Bearer token"
// }'
//                         className="mt-1 font-mono text-sm"
//                         rows={4}
//                       />
//                     </div>
//                   </div>
//                 )}

//                 {integration.type === 'whatsapp' && (
//                   <div className="space-y-3">
//                     <div>
//                       <Label htmlFor={`whatsapp-template-${index}`}>Template Name</Label>
//                       <Input
//                         id={`whatsapp-template-${index}`}
//                         value={integration.config.template || ''}
//                         onChange={(e) => updateIntegrationConfig(index, 'template', e.target.value)}
//                         placeholder="your_template_name"
//                         className="mt-1"
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor={`whatsapp-phone-field-${index}`}>Phone Number Field</Label>
//                       <Input
//                         id={`whatsapp-phone-field-${index}`}
//                         value={integration.config.phoneField || ''}
//                         onChange={(e) => updateIntegrationConfig(index, 'phoneField', e.target.value)}
//                         placeholder="Select phone field"
//                         className="mt-1"
//                       />
//                     </div>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       )}
//     </div>
//   );

  const renderNotificationsSettings = () => (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => addNotification('email')}
        >
          <Mail className="h-4 w-4 mr-2" />
          Email Notification
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => addNotification('whatsapp')}
        >
          <Phone className="h-4 w-4 mr-2" />
          WhatsApp Notification
        </Button>
        {/* <Button
          variant="outline"
          size="sm"
          onClick={() => addNotification('sms')}
        >
          <Phone className="h-4 w-4 mr-2" />
          SMS Notification
        </Button> */}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Bell className="h-12 w-12 mx-auto mb-2 opacity-30" />
          <h3 className="text-lg font-medium">No notifications configured</h3>
          <p className="max-w-xs mx-auto mt-1">
            Add notifications to alert team members of new submissions
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="bg-muted p-3 flex justify-between items-center">
                <div className="flex items-center">
                  {notification.type === 'email' && <Mail className="h-4 w-4 mr-2" />}
                  {notification.type === 'whatsapp' && <Phone className="h-4 w-4 mr-2" />}
                  {notification.type === 'sms' && <Phone className="h-4 w-4 mr-2" />}
                  <span className="font-medium capitalize">{notification.type} Notification</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`notification-${index}-enabled`}
                    checked={notification.enabled}
                    onCheckedChange={(checked) => updateNotification(index, 'enabled', checked)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeNotification(index)}
                    className="h-8 w-8 p-0 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <Label>Recipients</Label>
                    {notification.recipients.map((recipient:string, recipientIndex: number) => (
                      <div key={recipientIndex} className="flex items-center space-x-2 mt-1">
                        <Input
                          value={recipient}
                          onChange={(e) => updateNotificationRecipient(index, recipientIndex, e.target.value)}
                          placeholder={notification.type === 'email' ? 'email@example.com' : '+1234567890'}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRecipient(index, recipientIndex)}
                          disabled={notification.recipients.length === 1}
                          className="h-8 w-8 p-0 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addRecipient(index)}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Recipient
                    </Button>
                  </div>

                  {notification.type === 'email' && (
                    <>
                      <div>
                        <Label htmlFor={`notification-subject-${index}`}>Subject</Label>
                        <Input
                          id={`notification-subject-${index}`}
                          value={notification.subject || ''}
                          onChange={(e) => updateNotification(index, 'subject', e.target.value)}
                          placeholder="New form submission"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`notification-template-${index}`}>Email Template</Label>
                        <Textarea
                          id={`notification-template-${index}`}
                          value={notification.template || ''}
                          onChange={(e) => updateNotification(index, 'template', e.target.value)}
                          placeholder="You've received a new form submission."
                          rows={4}
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Use {`{{field_name}}`} to insert form field values
                        </p>
                      </div>
                    </>
                  )}

                  {(notification.type === 'whatsapp' || notification.type === 'sms') && (
                    <div>
                      <Label htmlFor={`notification-template-${index}`}>Message Template</Label>
                      <Textarea
                        id={`notification-template-${index}`}
                        value={notification.template || ''}
                        onChange={(e) => updateNotification(index, 'template', e.target.value)}
                        placeholder={`New form submission received from {{name}}. Check your dashboard for details.`}
                        rows={4}
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Use {`{{ field_name }}`}` to insert form field values
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className=" bg-accent gap-2  grid-cols-3 grid">
        <TabsTrigger className='border-none' value="general">General</TabsTrigger>
        <TabsTrigger className='border-none' value="thank-you">Thank You</TabsTrigger>
        {/* <TabsTrigger value="integrations">Integrations</TabsTrigger> */}
        <TabsTrigger className='border-none' value="notifications">Notifications</TabsTrigger>
      </TabsList>

      <div className="mt-8">
        <TabsContent value="general">
          {renderGeneralSettings()}
        </TabsContent>

        <TabsContent value="thank-you">
          {renderThankYouPageSettings()}
        </TabsContent>

        {/* <TabsContent value="integrations">
          {renderIntegrationsSettings()}
        </TabsContent> */}

        <TabsContent value="notifications">
          {renderNotificationsSettings()}
        </TabsContent>
      </div>
    </Tabs>
  );
}
