import * as Yup from 'yup';
import { Op } from 'sequelize';
import { startOfDay, endOfDay, getHours } from 'date-fns';

import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';

class DeliveryStartController {
  async update(req, res) {
    const schema = Yup.object().shape({
      deliveryman_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const delivaryman = await Deliveryman.findByPk(req.body.deliveryman_id);

    if (!delivaryman) {
      return res
        .status(400)
        .json({ error: 'You should create this delivaryman first' });
    }

    let delivery = await Delivery.findByPk(req.params.id);

    if (!delivery) {
      return res
        .status(400)
        .json({ error: 'You should create this delivery first' });
    }

    const today = new Date();

    const checkDeliveriesAmount = await Delivery.findAndCountAll({
      where: {
        deliveryman_id: req.body.deliveryman_id,
        canceled_at: null,
        start_date: {
          [Op.between]: [startOfDay(today), endOfDay(today)],
        },
      },
    });

    if (checkDeliveriesAmount.count > 5) {
      return res
        .status(400)
        .json({ error: 'You cant start more than 5 deliveries in a day' });
    }

    /*
     * checks if this delivery belongs for this deliveryman
     */
    const checkDeliveryman = await Delivery.findOne({
      where: {
        id: req.params.id,
        deliveryman_id: req.body.deliveryman_id,
      },
    });

    if (!checkDeliveryman) {
      return res
        .status(400)
        .json({ error: 'This delivery belongs to another deliveryman' });
    }

    if (delivery.start_date) {
      return res
        .status(400)
        .json({ error: 'This delivery has already been started' });
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

    const hour = getHours(new Date());

    const formatedTime = `${hour}:00`;

    const checkBusinessTime = schedule.includes(formatedTime);

    if (!checkBusinessTime) {
      return res.status(400).json({
        error:
          'It is only possible to pick up a delivery during business hours',
      });
    }

    await checkDeliveryman.update({ start_date: new Date() });

    return res.json({ message: 'Delivery started !' });
  }
}

export default new DeliveryStartController();
