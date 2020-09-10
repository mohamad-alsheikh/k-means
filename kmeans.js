// import d3 from './d3.v3.min.js';
var express = require('express');
var app = express();
var path = require('path');

    app.use(express.static(path.join(__dirname, 'public')));

function kMeans(elt, w, h, numPoints, numClusters, maxIter) {


    // the current iteration
    var iter = 1,
        centroids =[ [ 2.85409686e+04, -1.37439423e+05],
                     [ 8.99580000e+04, -1.39002821e+08],
                     [ 1.38521715e+08, -3.22385130e+07],
                     [ 1.00746241e+05, -9.75108870e+06],
                     [ 3.05225000e+05, -5.07810573e+07] ],
        points = d3.csv("./points.csv");
        
    var margin = {top: 30, right: 20, bottom: 20, left: 30},
        width = w - margin.left - margin.right,
        height = h - margin.top - margin.bottom;

    var colors = d3.scale.category20().range();
    
    var svg = d3.select(elt).append("svg")
        .style("width", width + margin.left + margin.right)
        .style("height", height + margin.top + margin.bottom);
        
    var group = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    svg.append("g")
        .append("text")
        .attr("class", "label")
        .attr("transform", "translate(" + (width - margin.left - margin.right) + 
            "," + (height + margin.top + margin.bottom) + ")")
        .text("");

    /**
     * Computes the euclidian distance between two points.
     */
    function getEuclidianDistance(a, b) {
        var dx = b.x - a.x,
            dy = b.y - a.y;
        return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    }
    
    /**
     * Returns a point with the specified type and fill color and with random 
     * x,y-coordinates.
     */
    function getRandomPoint(type, fill) {
        return { 
            x: Math.round(Math.random() * width), 
            y: Math.round(Math.random() * height),
            type: type,
            fill: fill 
        };
    }

    /** 
     * Generates a specified number of random points of the specified type.
     */
    function initializePoints(num, type) {
        var result = [];
        for (var i = 0; i < num; i++) {
            var color = colors[i];
            if (type !== "centroid") {
                color = "#ffffaa";
            }
            var point = getRandomPoint(type, color);
            point.id = point.type + "-" + i;
            result.push(point);
        }
        return result;
    }

    /**
     * Find the centroid that is closest to the specified point.
     */
    function findClosestCentroid(point) {
        var closest = {i: -1, distance: width * 2};
        centroids.forEach(function(d, i) {
            var distance = getEuclidianDistance(d, point);
            // Only update when the centroid is closer
            if (distance < closest.distance) {
                closest.i = i;
                closest.distance = distance;
            }
        });
        return (centroids[closest.i]); 
    }
    
    /**
     * All points assume the color of the closest centroid.
     */
    function colorizePoints() {
        points.forEach(function(d) {
            var closest = findClosestCentroid(d);
            d.fill = closest.fill;
        });
    }

    /**
     * Computes the center of the cluster by taking the mean of the x and y 
     * coordinates.
     */
    function computeClusterCenter(cluster) {
        return [
            d3.mean(cluster, function(d) { return d.x; }), 
            d3.mean(cluster, function(d) { return d.y; })
        ];
    }
    
    /**
     * Moves the centroids to the center of their cluster.
     */
    function moveCentroids() {
        centroids.forEach(function(d) {
            // Get clusters based on their fill color
            var cluster = points.filter(function(e) {
                return e.fill === d.fill;
            });
            // Compute the cluster centers
            var center = computeClusterCenter(cluster);
            // Move the centroid
            d.x = center[0];        
            d.y = center[1];
            // d.x = [2.85409686e+04, 8.99580000e+04, 1.38521715e+08, 1.00746241e+05, 3.05225000e+05];              
            // d.y = [-1.37439423e+05, -1.39002821e+08, -3.22385130e+07, -9.75108870e+06, -5.07810573e+07 ];
        });
    }

    /**
     * Updates the chart.
     */
    function update() {
    
        var data = points.concat(centroids);
        
        // The data join
        var circle = group.selectAll("circle")
            .data(data);
            
        // Create new elements as needed
        circle.enter().append("circle")
            .attr("id", function(d) { return d.id; })
            .attr("class", function(d) { return d.type; })
            .attr("r", 5);
            
        // Update old elements as needed
        circle.transition().delay(100).duration(1000)
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
            .style("fill", function(d) { return d.fill; });
        
        // Remove old nodes
        circle.exit().remove();
    }

    /**
     * Updates the text in the label.
     */
    function setText(text) {
        svg.selectAll(".label").text(text);
    }
    
    /**
     * Executes one iteration of the algorithm:
     * - Fill the points with the color of the closest centroid (this makes it 
     *   part of its cluster)
     * - Move the centroids to the center of their cluster.
     */
    function iterate() {
        
        // Update label
        setText("Iteration " + iter + " of " + maxIter);

        // Colorize the points
        colorizePoints();
        
        // Move the centroids
        moveCentroids();
        
        // Update the chart
        update();
    }

    /** 
     * The main function initializes the algorithm and calls an iteration every 
     * two seconds.
     */
    function initialize() {
        
        // Initialize random points and centroids
        centroids = initializePoints(numClusters, "centroid");
        points = initializePoints(numPoints, "points" );
        
        // initial drawing
        update();
        
        var interval = setInterval(function() {
            if(iter < maxIter + 1) {
                iterate();
                iter++;
            } else {
                clearInterval(interval);
                setText("Done");
            }
        }, 2 * 1000);
    }[  [ 2.85409686e+04, -1.37439423e+05],
        [ 8.99580000e+04, -1.39002821e+08],
        [ 1.38521715e+08, -3.22385130e+07],
        [ 1.00746241e+05, -9.75108870e+06],
        [ 3.05225000e+05, -5.07810573e+07] ]

    // Call the main function
    initialize();
}