const Guest = require('../models/Guest');

exports.createGuest = async (req, res) => {
  try {
    const {
      guestName,
      mobileNumber,
      emailAddress,
      company,
      relationship,
      interests,
      followUpRequired,
      preferredMethod,
      rating,
      liked,
      comments,
      eventDate,
      relationshipOther
    } = req.body;

    const newGuest = new Guest({
      event: {
        eventDate: eventDate || Date.now()
      },
      guest: {
        name: guestName,
        phone: mobileNumber,
        email: emailAddress,
        company: company
      },
      relationship: relationship === 'Other' && relationshipOther ? relationshipOther : relationship,
      interests: interests || [],
      followUp: {
        required: followUpRequired,
        preferredMethod: preferredMethod
      },
      feedback: {
        rating,
        liked: liked || [],
        comments
      }
    });

    const savedGuest = await newGuest.save();
    res.status(201).json({ message: 'Guest saved successfully', guest: savedGuest });
  } catch (error) {
    console.error('Error saving guest:', error);
    res.status(500).json({ message: 'Failed to save guest', error: error.message });
  }
};
