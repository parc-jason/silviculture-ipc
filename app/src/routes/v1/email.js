const emailRouter = require('express').Router();
const Problem = require('api-problem');

const chesService = require('../../chesService');
const validation = require('../../middleware/validation');

emailRouter.post('/', validation.validateEmail, async (req, res) => {
  try {
    const email = {
      body: `<p>Message from Silviculture IPC</p> <p><strong>User comments:</strong><br/>${req.body.comments}`,
      bodyType: 'html',
      from: req.body.from,
      priority: 'high',
      to: ['NR.CommonServiceShowcase@gov.bc.ca'],
      subject: `Silviculture IPC Message from ${req.body.idir}`
    };
    const result = await chesService.send(email);
    return res.status(201).json(result);
  } catch (error) {
    return new Problem(500, { detail: error.message }).send(res);
  }
});

module.exports = emailRouter;
