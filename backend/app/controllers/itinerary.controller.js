import Itinerary from "../models/itinerary.model.js";
import VisitTime from "../models/visitTime.model.js";

const attachActivitiesToItineraries = async (itineraries = []) => {
  const plainItineraries = itineraries.map((item) =>
    typeof item.toObject === "function" ? item.toObject() : item
  );

  const itineraryIds = plainItineraries.map((item) => item._id);

  const visitTimes = await VisitTime.find({
    itinerary: { $in: itineraryIds },
  })
    .populate("attraction")
    .sort({ day: 1, session: 1, time: 1 })
    .lean();

  return plainItineraries.map((item) => {
    const activities = visitTimes
      .filter(
        (visit) =>
          visit.itinerary &&
          visit.itinerary.toString() === item._id.toString()
      )
      .map((visit) => ({
        _id: visit._id,
        session: visit.session,
        time: visit.time,
        activityName: visit.note || "",
        attractionName: visit.attraction?.name || "",
        attraction: visit.attraction || null,
        note: visit.note || "",
      }));

    return {
      ...item,
      activities,
    };

  });
};

export const getItineraries = async (req, res) => {
  try {
    const itineraries = await Itinerary.find()
      .populate("tour")
      .populate("attractions")
      .sort({ day: 1 });
    const data = await attachActivitiesToItineraries(itineraries);
    res.status(200).json({
      success: true,
      message: "Lấy danh sách lịch trình thành công",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách lịch trình",
      error: error.message,
    });
  }
};

export const getItineraryById = async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id)
      .populate("tour").populate("attractions");

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch trình",
      });
    }

    const data = await attachActivitiesToItineraries([itinerary]);
    res.status(200).json({
      success: true,
      message: "Lấy thông tin lịch trình thành công",
      data: data[0],
    });
} catch (error) {
  console.error("[getItineraryById]", error);

  res.status(500).json({
    success: false,
    message: "Lỗi khi lấy thông tin lịch trình",
    error: error.message,
  });
}
};

export const getItinerariesByTour = async (req, res) => {
  try {
    const itineraries = await Itinerary.find({
      tour: req.params.tourId,
    })
      .populate("tour")
      .populate("attractions")
      .sort({ day: 1 });

    const data = await attachActivitiesToItineraries(itineraries);

    res.status(200).json({
      success: true,
      message: "Lấy lịch trình theo tour thành công",
      data,
    });

  } catch (error) {
    console.error("[getItinerariesByTour]", error);

    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy lịch trình theo tour",
      error: error.message,
    });

  }
};

export const createItinerary = async (req, res) => {
  try {
    // Remove any client-provided title to enforce using activity name
    const { title, ...rest } = req.body;
    const itinerary = await Itinerary.create(rest);

    // If activities exist, set title to the first activity's name
    if (itinerary.activities && itinerary.activities.length > 0) {
      itinerary.title = itinerary.activities[0].activityName || "";
      await itinerary.save();
    }

    const populatedItinerary = await Itinerary.findById(itinerary._id)
      .populate("tour");

    const data = await attachActivitiesToItineraries([populatedItinerary]);

    res.status(201).json({
      success: true,
      message: "Tạo lịch trình thành công",
      data: data[0],
    });

  } catch (error) {
    console.error("[createItinerary]", error);

    res.status(400).json({
      success: false,
      message: "Lỗi khi tạo lịch trình",
      error: error.message,
    });

  }
};

export const updateItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("tour");

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch trình",
      });
    }

    const data = await attachActivitiesToItineraries([itinerary]);

    res.status(200).json({
      success: true,
      message: "Cập nhật lịch trình thành công",
      data: data[0],
    });

  } catch (error) {
    console.error("[updateItinerary]", error);

    res.status(400).json({
      success: false,
      message: "Lỗi khi cập nhật lịch trình",
      error: error.message,
    });

  }
};

export const deleteItinerary = async (req, res) => {
try {
const itinerary = await Itinerary.findById(req.params.id);

if (!itinerary) {
  return res.status(404).json({
    success: false,
    message: "Không tìm thấy lịch trình",
  });
}

await VisitTime.deleteMany({
  itinerary: itinerary._id,
});

await Itinerary.findByIdAndDelete(req.params.id);

res.status(200).json({
  success: true,
  message: "Xóa lịch trình và hoạt động liên quan thành công",
});

} catch (error) {
console.error("[deleteItinerary]", error);

res.status(500).json({
  success: false,
  message: "Lỗi khi xóa lịch trình",
  error: error.message,
});

}
};