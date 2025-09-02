import express from 'express';
import { SubscriptionController } from './userEmailSubscripton.controller';

const router = express.Router();


router.post(
  '/', 
  SubscriptionController.createSubscription
);



export const UserSubscriptionRoutes = router;