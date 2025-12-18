import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/*== STEP 1 ===============================================================
The section below creates the schema for Bill Dividr.
=========================================================================*/
const schema = a.schema({
  Group: a
    .model({
      name: a.string().required(),
      description: a.string(),
      members: a.hasMany('Member', 'groupId'),
      expenses: a.hasMany('Expense', 'groupId'),
      settlements: a.hasMany('Settlement', 'groupId'),
    })
    .authorization((allow) => [allow.owner()]),

  Member: a
    .model({
      name: a.string().required(),
      groupId: a.id().required(),
      group: a.belongsTo('Group', 'groupId'),
      isActive: a.boolean(),
    })
    .authorization((allow) => [allow.owner()]),

  Expense: a
    .model({
      description: a.string().required(),
      amount: a.float().required(),
      payerId: a.string().required(), // ID of the Member who paid
      involvedMemberIds: a.string().array().required(), // List of Member IDs
      groupId: a.id().required(),
      group: a.belongsTo('Group', 'groupId'),
    })
    .authorization((allow) => [allow.owner()]),

  Settlement: a
    .model({
      amount: a.float().required(),
      payerId: a.string().required(),
      receiverId: a.string().required(),
      groupId: a.id().required(),
      group: a.belongsTo('Group', 'groupId'),
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
