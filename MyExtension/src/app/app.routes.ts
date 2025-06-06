import { Routes } from '@angular/router';
// import { LoginComponent } from './login/';
import { RegisterComponent } from './register/register.component';
import { AdminDashboardComponent } from './admindashboard/admindashboard.component';
import { UserDashboardComponent } from './userdeshbaord/userdeshbaord.component';
import  {LoginComponent}  from './login/login.component';
import { UserDetailsComponent } from './user-details/user-details.component';
import { UserHistoryComponent } from './user-history/user-history.component';



export const routes: Routes = [
     {
    path: '',
    component : LoginComponent
    // redirectTo: '/login',  // Redirect to login as the default route
    // pathMatch: 'full',
  },
        {
            path:'login',
            component:LoginComponent
        },
        {
            path:'register',
            component:RegisterComponent
        }
        ,
        {
            path:'admindashboard',
            component:AdminDashboardComponent
        }

         ,
        {
            path:'userdashboard',
            component:UserDashboardComponent
        }
        ,
        {
           path: 'user-details/:id', 
           component: UserDetailsComponent 

        },

        {
            path:"user-history",
            component:UserHistoryComponent
        }
       
];
