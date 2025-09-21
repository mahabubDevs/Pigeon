import { Router } from 'express';
import { ContactController } from './contact.controller';

const router = Router();

router.post('/', ContactController.createContact);

export const ContactRoute = router;
