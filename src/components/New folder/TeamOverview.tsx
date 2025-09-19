import React, { useState, useEffect } from "react";
import {
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  UserCheck,
  UserX,
  MoreVertical,
} from "lucide-react";
import {
  teamAPI,
  timeEntryAPI,
  type TimeEntry,
  type TeamMember as ApiTeamMember,
} from "@/lib/api";

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "on_leave";
  avatar?: string;
  lastActive?: string;
  currentProject?: string;
}

// Helper function to convert API status to local status
const convertStatus = (
  apiStatus: string
): "active" | "inactive" | "on_leave" => {
  switch (apiStatus.toLowerCase()) {
    case "active":
      return "active";
    case "inactive":
    case "pending":
      return "inactive";
    default:
      return "inactive";
  }
};

interface TeamOverviewProps {
  timeEntries: TimeEntry[];
}

export const TeamOverview: React.FC<TeamOverviewProps> = ({ timeEntries }) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const response = await teamAPI.getAllTeam();
        if (response.success && response.data) {
          // Convert API team members to local format
          const convertedMembers: TeamMember[] = response.data.map(
            (member: ApiTeamMember) => ({
              _id: member._id,
              name: member.name,
              email: member.email,
              role: member.role || "Team Member",
              status: convertStatus(member.status),
              lastActive: new Date(
                Date.now() - Math.random() * 24 * 60 * 60 * 1000
              ).toISOString(),
              currentProject: `Project ${Math.floor(Math.random() * 5) + 1}`,
            })
          );
          setTeamMembers(convertedMembers);
        } else {
          // Fallback sample data
          const sampleTeam: TeamMember[] = [
            {
              _id: "user-1",
              name: "Sarah Johnson",
              email: "sarah@company.com",
              role: "Senior Developer",
              status: "active",
              lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              currentProject: "E-commerce Platform",
            },
            {
              _id: "user-2",
              name: "Mike Chen",
              email: "mike@company.com",
              role: "UI/UX Designer",
              status: "active",
              lastActive: new Date(
                Date.now() - 2 * 60 * 60 * 1000
              ).toISOString(),
              currentProject: "Mobile App Redesign",
            },
            {
              _id: "user-3",
              name: "Emily Davis",
              email: "emily@company.com",
              role: "Project Manager",
              status: "on_leave",
              lastActive: new Date(
                Date.now() - 24 * 60 * 60 * 1000
              ).toISOString(),
              currentProject: "Client Portal",
            },
            {
              _id: "user-4",
              name: "Alex Rodriguez",
              email: "alex@company.com",
              role: "Backend Developer",
              status: "active",
              lastActive: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
              currentProject: "API Integration",
            },
          ];
          setTeamMembers(sampleTeam);
        }
      } catch (error) {
        console.error("Failed to fetch team data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, []);

  // Calculate team member performance metrics
  const getTeamMemberStats = (userId: string) => {
    const memberEntries = timeEntries.filter(
      (entry) => entry.userId === userId
    );
    const totalHours = memberEntries.reduce(
      (acc, entry) => acc + entry.duration / 3600,
      0
    );
    const billableHours = memberEntries
      .filter((entry) => entry.billable)
      .reduce((acc, entry) => acc + entry.duration / 3600, 0);

    return {
      totalHours: totalHours.toFixed(1),
      billableHours: billableHours.toFixed(1),
      entriesCount: memberEntries.length,
      productivity:
        totalHours > 0 ? ((billableHours / totalHours) * 100).toFixed(0) : "0",
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400";
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-500/10 dark:text-gray-400";
      case "on_leave":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-500/10 dark:text-gray-400";
    }
  };

  const getLastActiveText = (lastActive: string) => {
    const now = new Date();
    const lastActiveDate = new Date(lastActive);
    const diffInMinutes = Math.floor(
      (now.getTime() - lastActiveDate.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const activeMembers = teamMembers.filter(
    (member) => member.status === "active"
  ).length;
  const onLeaveMembers = teamMembers.filter(
    (member) => member.status === "on_leave"
  ).length;
  const totalMembers = teamMembers.length;

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 bg-gray-200 dark:bg-gray-700 rounded"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Team Overview
          </h2>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <UserCheck className="w-4 h-4 text-green-600" />
            <span className="text-gray-600 dark:text-gray-400">
              {activeMembers} Active
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <UserX className="w-4 h-4 text-yellow-600" />
            <span className="text-gray-600 dark:text-gray-400">
              {onLeaveMembers} On Leave
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {teamMembers.map((member) => {
          const stats = getTeamMemberStats(member._id);
          return (
            <div
              key={member._id}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-700 ${
                        member.status === "active"
                          ? "bg-green-500"
                          : member.status === "on_leave"
                          ? "bg-yellow-500"
                          : "bg-gray-400"
                      }`}
                    ></div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {member.name}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          member.status
                        )}`}
                      >
                        {member.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {member.role}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {member.currentProject &&
                        `Working on: ${member.currentProject}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {stats.totalHours}h total
                    </div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400">
                      {stats.billableHours}h billable
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {stats.productivity}% productive
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {member.lastActive &&
                        getLastActiveText(member.lastActive)}
                    </div>
                  </div>

                  <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {teamMembers.length === 0 && (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No team members found
          </p>
        </div>
      )}
    </div>
  );
};
