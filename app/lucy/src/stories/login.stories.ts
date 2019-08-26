import { storiesOf, moduleMetadata } from '@storybook/angular';
import { action } from '@storybook/addon-actions';
import { LoginComponent } from '../app/components/Routes/login/login.component';



storiesOf('Login', module).add('components', () => ({
  component: LoginComponent,
  props: {},
}));

