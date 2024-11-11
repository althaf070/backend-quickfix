import express from 'express';
import { createService, deleteProviderService, editProviderService, getAllServices, getProviderServices, getServiceById, getServiceByName, getServiceWithOutCurrentProvider, getUsedServicesWithProviders  } from '../controllers/serviceController.js';
import { verifyProviderToken } from '../middleware/verifyProviderToken.js';
import { verifyToken } from '../middleware/verifytoken.js';

const router = express.Router();
// for users
router.get('/allservices',verifyToken,getAllServices)
router.get('/getservicebyname/:sname',verifyToken,getServiceByName)
router.get('/used',verifyToken,getUsedServicesWithProviders)
router.get('/:sid',verifyToken,getServiceById)


// for providers
router.get('/providerexception/:pid',verifyProviderToken,getServiceWithOutCurrentProvider)

router.get('/providerservices/:pid',verifyProviderToken,getProviderServices)

router.post('/create',verifyProviderToken,createService)
router.put('/edit/:sid',verifyProviderToken,editProviderService)
router.delete('/delete/:sid',verifyProviderToken,deleteProviderService)

export default router