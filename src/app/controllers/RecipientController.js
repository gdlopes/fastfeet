import * as Yup from 'yup';

import Recipient from '../models/Recipient';

class RecipientController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      zipCode: Yup.string().required(),
      city: Yup.string().required(),
      state: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.string().required(),
      complement: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      res.status(400).json({ error: 'Validation fails' });
    }

    const { name } = req.body;

    const recipient = await Recipient.findOne({ where: { name } });

    if (recipient) {
      res.status(400).json({ error: 'This recipient already exists' });
    }

    const {
      zipCode,
      city,
      state,
      street,
      number,
      complement,
    } = await Recipient.create(req.body);

    return res.json({
      name,
      zipCode,
      city,
      state,
      street,
      number,
      complement,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().strict(),
      zipCode: Yup.string(),
      city: Yup.string().strict(),
      state: Yup.string().strict(),
      street: Yup.string().strict(),
      number: Yup.string(),
      complement: Yup.string().strict(),
    });

    if (!(await schema.isValid(req.body))) {
      res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;

    const recipient = await Recipient.findByPk(id);

    if (!recipient) {
      res.status(400).json({ error: 'Recipient does not exists' });
    }

    const {
      name,
      zipCode,
      city,
      state,
      street,
      number,
      complement,
    } = await recipient.update(req.body);

    return res.json({
      name,
      zipCode,
      city,
      state,
      street,
      number,
      complement,
    });
  }

  async index(req, res) {
    const recipients = await Recipient.findAll();

    return res.json(recipients);
  }

  async show(req, res) {
    const { id } = req.params;

    const recipient = await Recipient.findByPk(id);

    if (!recipient) {
      res.status(400).json({ error: 'Recipient does not exists' });
    }

    return res.json(recipient);
  }

  async delete(req, res) {
    const { id } = req.params;

    const recipient = await Recipient.findByPk(id);

    if (!recipient) {
      res.status(400).json({ error: 'Recipient does not exists' });
    }

    await recipient.destroy();

    return res.json({ message: 'Recipient deleted !' });
  }
}

export default new RecipientController();
