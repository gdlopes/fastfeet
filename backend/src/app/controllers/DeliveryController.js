import * as Yup from 'yup';
import { isBefore, getHours, parseISO } from 'date-fns';

import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import Delivery from '../models/Delivery';

import Mail from '../../lib/Mail';

class DeliveryController {
  async index(req, res) {
    const deliveries = await Delivery.findAll();

    return res.json(deliveries);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { recipient_id, deliveryman_id, product } = req.body;

    const recipient = await Recipient.findByPk(recipient_id);

    if (!recipient) {
      return res.status(400).json({ error: 'This recipient does not exist' });
    }

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'This deliveryman does not exist' });
    }

    const delivery = await Delivery.create({
      recipient_id,
      deliveryman_id,
      product,
    });

    const { email, name } = deliveryman;

    await Mail.sendMail({
      to: `${name} <${email}>`,
      subject: 'New delivery registered',
      template: 'newDelivery',
      context: {
        deliveryman: deliveryman.name,
        recipientName: recipient.name,
        recipientStreet: recipient.street,
        recipientStreetNumber: recipient.number,
        recipientState: recipient.state,
        recipientCity: recipient.city,
        recipientZipcode: recipient.zipCode,
        product: delivery.product,
      },
    });

    return res.json(delivery);
  }

  async update(req, res) {
    let delivery = await Delivery.findByPk(req.params.id);

    if (!delivery) {
      return res.status(400).json({ error: 'This delivery does not exist' });
    }

    const schema = Yup.object().shape({
      recipient_id: Yup.number(),
      deliveryman_id: Yup.number(),
      signature_id: Yup.number(),
      product: Yup.string(),
      canceled_at: Yup.date(),
      start_date: Yup.date(),
      end_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { recipient_id, deliveryman_id } = req.body;
    const recipient = await Recipient.findByPk(recipient_id);
    const deliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!recipient) {
      return res.status(400).json({ error: 'Please inform a valid recipient' });
    }

    if (!deliveryman) {
      return res
        .status(400)
        .json({ error: 'Please inform a valid deliveryman' });
    }

    const { start_date, end_date } = req.body;

    if (isBefore(parseISO(end_date), parseISO(start_date))) {
      return res
        .status(400)
        .json({ error: 'End date should be after start date' });
    }

    const schedule = [
      '8:00',
      '9:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
      '18:00',
    ];

    const hour = getHours(new Date(start_date));

    const formatedTime = `${hour}:00`;

    const checkBusinessTime = schedule.includes(formatedTime);

    if (!checkBusinessTime) {
      return res.status(400).json({
        error:
          'It is only possible to pick up a delivery during business hours',
      });
    }

    const { signature_id, product, canceled_at } = await delivery.update(
      req.body
    );

    return res.json({
      recipient_id,
      deliveryman_id,
      signature_id,
      product,
      canceled_at,
      start_date,
      end_date,
    });
  }

  async delete(req, res) {
    const delivery = await Delivery.findByPk(req.params.id);

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery does not exist' });
    }

    await delivery.destroy();

    return res.json({ message: 'Delivery deleted !' });
  }
}

export default new DeliveryController();
