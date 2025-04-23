import { Report } from "../models/index.js";

export async function addReport(req, res) {
    try {



        const reportedId = req.params.id
        const reporterId = req.user.id
        const reason = req.body.reason
        const description = req.body.description
        const type = req.body.type

        const newReport = await Report.create({
            reportedId,
            reporterId,
            reason,
            description,
            type
        })

        return res.status(201).json({
            message: 'Report submitted successfully',
            report: newReport
        });

    } catch (error) {
        console.error('Error creating report:', error);
        return res.status(500).json({ message: 'Error creating report', error: error.message });
    }

}    