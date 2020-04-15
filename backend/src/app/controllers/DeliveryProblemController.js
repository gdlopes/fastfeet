import * as Yup from 'yup';

import Delivery from '../models/Delivery';
import DeliveryProblem from '../models/DeliveryProblem';
import Deliveryman from '../models/Deliveryman';

import Mail from '../../lib/Mail';

class DeliveryProblemController {
  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const delivery = await Delivery.findByPk(req.params.id);

    if (!delivery) {
      return res.status(400).json({ error: 'This delivery does not exists' });
    }

    const { description } = req.body;

    const deliveryProblem = await DeliveryProblem.create({
      delivery_id: delivery.id,
      description,
    });

    const { delivery_id } = deliveryProblem;

    return res.json({ delivery_id, description });
  }

  async index(req, res) {
    const deliveriesWithProblems = await DeliveryProblem.findAll();

    if (!deliveriesWithProblems) {
      return res.status(400).json({ error: 'There is no problem registered' });
    }

    return res.json(deliveriesWithProblems);
  }

  async show(req, res) {
    const { id } = req.params;

    const deliveryWithProblems = await DeliveryProblem.findAll({
      where: {
        delivery_id: id,
      },
    });

    if (!deliveryWithProblems) {
      return res
        .status(400)
        .json({ error: 'There is no problem registered for this delivery' });
    }

    return res.json(deliveryWithProblems);
  }

  async delete(req, res) {
    const deliveryProblem = await DeliveryProblem.findByPk(req.params.id);

    if (!deliveryProblem) {
      return res
        .status(400)
        .json({ error: 'There is no problem registered for this delivery' });
    }

    const { delivery_id, description } = deliveryProblem;

    const delivery = await Delivery.findByPk(delivery_id);

    if (delivery.canceled_at) {
      return res
        .status(400)
        .json({ error: 'This delivery has already been canceled' });
    }

    await delivery.update({ canceled_at: new Date() });

    const { name, email } = await Deliveryman.findByPk(delivery.deliveryman_id);

    await Mail.sendMail({
      to: `${name} <${email}>`,
      subject: 'Delivery cancelation',
      template: 'cancelation',
      context: {
        deliveryman: name,
        product: delivery.product,
        description,
      },
    });

    return res.json({ message: 'Delivery canceled !' });
  }
}

export default new DeliveryProblemController();
