import { RouteBus as Bus } from '../Route.Bus';
import { RouteTable as Table } from '../Route.Table';
import { RouteView as View } from '../Route.View';

export const Route = {
  Bus,
  Table,
  View,

  Dev: {
    ...View.Dev,
    ...Bus.Dev,
  },
};
