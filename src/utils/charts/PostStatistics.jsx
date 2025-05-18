import React from 'react';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import '../../styles/PostStatistics.scss';

const COLORS = ["#4CAF50", "#FF5733", "#FFD700", "#4285F4", "#9C27B0", "#00BCD4"];

export default function PostStatistics({ post }) {
    const { stats } = post || {};

    // Format data for the bar chart
    const formatBarData = () => {
        return [
            { name: "Vues", value: stats?.views || 0, color: "#4CAF50" },
            { name: "Clics", value: stats?.clicks || 0, color: "#FF5733" },
            { name: "Partages", value: stats?.shares || 0, color: "#FFD700" },
            { name: "Signalements", value: stats?.reportingCount || 0, color: "#FFC107" }
        ];
    };

    // Format data for pie charts
    const formatPieData = (dataObj) => {
        if (!dataObj) return [];

        return Object.entries(dataObj).map(([name, value]) => ({
            name,
            value
        }));
    };

    const barData = formatBarData();
    const viewsByCityData = formatPieData(stats?.views_per_city);
    const clicksByCityData = formatPieData(stats?.clicks_per_city);
    const sharesByCityData = formatPieData(stats?.shares_per_city);
    const reportsByCityData = formatPieData(stats?.report_per_city);

    // Custom tooltip for pie charts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="label">{`${payload[0].name}: ${payload[0].value}`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="post-statistics-charts">
            {/* Main stats bar chart */}
            <div className="chart-container full-width">
                <h3>Aperçu des interactions</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        data={barData}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Nombre" fill="#8884d8">
                            {barData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Pie charts for city distribution */}
            <div className="charts-row">
                {/* Views by city */}
                <div className="chart-container">
                    <h3>Vues par ville</h3>
                    {viewsByCityData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={viewsByCityData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={true}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {viewsByCityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="no-data-message">
                            Aucune donnée de vues par ville disponible
                        </div>
                    )}
                </div>

                {/* Clicks by city */}
                <div className="chart-container">
                    <h3>Clics par ville</h3>
                    {clicksByCityData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={clicksByCityData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={true}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {clicksByCityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="no-data-message">
                            Aucune donnée de clics par ville disponible
                        </div>
                    )}
                </div>

                {/* Shares by city */}
                <div className="chart-container">
                    <h3>Partages par ville</h3>
                    {sharesByCityData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={sharesByCityData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={true}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {sharesByCityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="no-data-message">
                            Aucune donnée de partages par ville disponible
                        </div>
                    )}
                </div>

                {/* Reports by city */}
                <div className="chart-container">
                    <h3>Signalements par ville</h3>
                    {reportsByCityData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={reportsByCityData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={true}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {reportsByCityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="no-data-message">
                            Aucune donnée de signalements par ville disponible
                        </div>
                    )}
                </div>
            </div>

            {/* Summary stats */}
            <div className="chart-container full-width">
                <h3>Résumé des statistiques</h3>
                <div className="stats-summary">
                    <div className="stat-item">
                        <div className="stat-value">{stats?.views || 0}</div>
                        <div className="stat-label">Vues totales</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">{stats?.clicks || 0}</div>
                        <div className="stat-label">Clics totaux</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">
                            {stats?.clicks && stats?.views
                                ? `${((stats.clicks / stats.views) * 100).toFixed(1)}%`
                                : '0%'}
                        </div>
                        <div className="stat-label">Taux de conversion</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">{stats?.reportingCount || 0}</div>
                        <div className="stat-label">Signalements</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
