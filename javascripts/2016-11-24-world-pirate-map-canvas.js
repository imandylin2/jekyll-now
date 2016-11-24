var container = d3.select("#viz-container"),
    containerWidth = parseInt(container.style("width")),
    containerHeight = parseInt(container.style("height")),
    width = containerWidth,
    height = width / 1.6;
canvas = d3.select("canvas").attr("width", width).attr("height", height),
    svg = d3.select("svg").attr("width", width).attr("height", height),
    context = canvas.node().getContext("2d"),
    radius = 2.5;

var pageinfo = [
        [60, 0, 1, "<p>地圖上的紅點，是國際海事局（IMB）紀錄的海盜事件，時間介於2010-2016年第3季。原本IMB報告裡共記載2,056起海盜事件，刪去沒有經緯度的條目後，地圖上共有1,876起海盜事件。</p>", 0],
        [60, 0, 1, "<p>可以看到，紅點主要集中在三大地區：「 馬六甲海峽」、「亞丁灣」和「幾內亞灣」。</p>", 0],
        [103.924752, 1.235077, 4.5, "<p>由於作為歐亞貿易路線中繼站，加上航道狹窄，馬六甲海峽一直是海盜熱點。地圖上紅框框起來的地區約有540起海盜事件，佔總數的近三成。</p>", 103.924752, "馬六甲海峽"],
        [103.924752, 1.235077, 50, "<p>其中，新加坡周邊海域的海盜活動特別密集。統計地圖小紅框內的海盜事件後，做成下面的逐年累積圖。可以看到，新加坡海峽附近的海盜活動，在2015年攀抵高峰。</p><img width='300px' src='/images/malacca.svg' />", 103.924752],
        [43.366799, 12.604458, 4.5, "<p>亞丁灣周邊海域是另一個海盜活動猖獗的海域。亞丁灣是全球石油貿易的重要航線，波斯灣石油國的石油，主要通過亞丁灣運往北美及歐洲。</p><p>這些值錢的貨物，引來了以索馬利亞等東非國家為根據地的海盜。</p>", 43.366799, "亞丁灣"],
        [43.366799, 12.604458, 50, "<p>曼德海峽是東非海盜最愛下手的海域之一。下面的長條圖統計了地圖紅色框框內海盜活動：海盜活動在2011年後逐漸減少，2014年後該海域幾乎沒有出現海盜活動，顯示歐美艦隊加強力道護航收效。</p><img width='300px' src='/images/mandeb.svg' />", 43.366799],
        [3.60585, 2.92535, 4.5, "<p>隨著西非石油產業蓬勃發展，西非石油航線起點幾內亞灣湧現海盜活動。我們統計了紅框的海盜活動，結果如下：2016年幾內亞灣海盜活動激增，成為全球海盜問題最嚴重的海域之一。</p><img width='300px' src='/images/guinea.svg' />", 3.60585, "幾內亞灣"],
        [75, 0, 2.3718289988, "<p>根據IMB的資料，2010-2016年第3季，在台灣註冊的船隻被海盜攻擊的次數是7次（地圖上的紅點，有兩個點被蓋在其他紅點的後面，放大地圖就看得到了），其中3次海盜僅止於對船隻開火，4次船隻遭狹持。</p><p>地圖顯示，台灣船隻遭遇的海盜事件中，2件發生在南海，其他5件發生在印度洋。</p>", 75],
        [60, 0, 1, "<p>讀者可以縮放地圖，觀察全球海盜活動的分佈情況。</p>", 0]

    ],
    pageindex = 0,
    center = pageinfo[pageindex];

var projection = d3.geoRobinson()
    .scale(153)
    .translate([width / 2, height / 2])
    .precision(0.1),
    path = d3.geoPath().projection(projection).context(context),
    graticule = d3.geoGraticule();

var triangle = d3.symbol().type(d3.symbolTriangle).size(1000),
    circle = d3.symbol().type(d3.symbolCircle).size(150);

var zoom = d3.zoom()
    .scaleExtent([0.32, 50])
    .on("zoom", zoomed);

function render() {
    var forwardButton = svg.append("path")
        .attr("class", "button forward-button")
        .attr("d", triangle)
        .on("click", function() {
            d3.select(this)
                .style("fill", "black")
                .transition()
                .duration(200)
                .style("fill", "#DF2935");
            transition(canvas, "forward");
        });

    var backwardButton = svg.append("path")
        .attr("class", "button backward-button")
        .attr("d", triangle)
        .on("click", function() {
            d3.select(this)
                .style("fill", "black")
                .transition()
                .duration(200)
                .style("fill", "#DF2935");
            transition(canvas, "backward");
        });

    if (width > 480) {
        forwardButton.attr("transform", "translate(100,50) rotate(90)");
        backwardButton.attr("transform", "translate(50,50) rotate(270)");
    } else {
        forwardButton.attr("transform", "translate(100,35) rotate(90)");
        backwardButton.attr("transform", "translate(50,35) rotate(270)");
    }

    var progressCircle = svg.selectAll(".progress-circle")
        .data(d3.range(pageinfo.length))
        .enter()
        .append("path")
        .attr("class", "progress-circle")
        .attr("d", circle)
        .on("click", function(d) {
            pageindex = d;
            transition(canvas, "page");
        });

    if (width > 480) {
        progressCircle.attr("transform", function(d) {
            return "translate(75, " + (115 + d * 40) + ")"
        });
    } else {
        progressCircle.attr("transform", function(d) {
            return "translate(" + (width / 9 / 2 + d * width / 9) + ", 80)"
        });
    }

    d3.selectAll(".progress-circle")
        .filter(function(d) {
            return d == 0;
        })
        .classed("active", true)
        .style("fill", "black");

    d3.select("#text-container")
        .html(pageinfo[0][3]);
}

render();

d3.queue()
    .defer(d3.json, "/data/world_simplified.json")
    .defer(d3.csv, "/csv/pirate_final.csv")
    .await(ready);

function ready(error, world, pirate) {
    if (error) throw error;

    window.pirate = pirate;
    window.world = world;

    var re = new RegExp("Taiwan");

    window.taiwan = pirate.filter(function(d) {
        return re.test(d.name);
    });

    canvas.call(zoom)
        .call(zoom.transform, transform);
}

function x(x, y) {
    return projection([x, y])[0];
}

function y(x, y) {
    return projection([x, y])[1];
}

function zoomed() {
    context.textAlign = "center";
    context.font = "16px Arial";
    context.save();
    context.clearRect(0, 0, width, height);
    context.translate(d3.event.transform.x, d3.event.transform.y);
    context.scale(d3.event.transform.k, d3.event.transform.k);
    if (pageindex == 7) {
        draw(d3.event.transform, "rgba(255, 0, 0, 0.2)");
    } else {
        draw(d3.event.transform);
    }
    context.restore();
}

function draw(transform, fill = "red") {
    context.beginPath();
    path({
        type: "Sphere"
    });
    context.fillStyle = "#81d4fa";
    context.fill();

    context.beginPath();
    path(topojson.feature(world, world.objects.geo));
    context.fillStyle = "#f2f5f6";
    context.fill();

    context.beginPath();
    pirate.forEach(function(point) {
        context.moveTo(x(point.long, point.lat), y(point.long, point.lat));
        context.arc(x(point.long, point.lat), y(point.long, point.lat), radius / transform.k, 0, 2 * Math.PI);
    });
    context.fillStyle = fill;
    context.fill();

    if (pageindex == 7) {
        taiwan.forEach(function(point) {
            context.beginPath();
            context.moveTo(x(point.long, point.lat) + radius * 2 / transform.k, y(point.long, point.lat));
            context.arc(x(point.long, point.lat), y(point.long, point.lat), radius * 2 / transform.k, 0, 2 * Math.PI);
            context.fillStyle = "red";
            context.fill();
            context.strokeStyle = "white";
            context.lineWidth = 2 / transform.k;
            context.stroke();
        });
    }

    context.beginPath();
    path(graticule());
    context.strokeStyle = "rgba(119,119,119,0.5)";
    context.lineWidth = 0.5 / transform.k;
    context.stroke();

    if ([1, 2, 3, 4, 5, 6].indexOf(pageindex) != -1) {
        pageinfo.filter(function(d) {
                return d[2] == 4.5;
            })
            .forEach(function(point) {
                context.beginPath();
                context.rect(x(point[0], point[1]) - 25,
                    y(point[0], point[1]) - 25, 50, 50)
                context.strokeStyle = "red";
                context.lineWidth = 2;
                context.stroke();

                context.fillStyle = 'black';
                context.fillText(point[5], x(point[0], point[1]),
                    y(point[0], point[1]) - 30);
            })
    }
}

function transform() {
    if (width > 480) {
        return d3.zoomIdentity
            .translate(width / 3 * 2, height / 2)
            .scale(center[2])
            .translate(-x(center[0], center[1]), -y(center[0], center[1]));
    } else if (width < 480 && width > 360) {
        return d3.zoomIdentity
            .translate(width / 2, height / 2)
            .scale(center[2] / 2)
            .translate(-x(center[4], center[1]), -y(center[4], center[1]));
    } else {
        return d3.zoomIdentity
            .translate(width / 2, height / 2)
            .scale(center[2] / 3)
            .translate(-x(center[4], center[1]), -y(center[4], center[1]));
    }
}

function transition(canvas, direction) {
    if (direction == "forward") {
        pageindex = pageindex + 1 > pageinfo.length - 1 ? pageinfo.length - 1 : pageindex + 1;
    } else if (direction == "backward") {
        pageindex = pageindex - 1 > 0 ? pageindex - 1 : 0;
    } else {
        pageindex = pageindex;
    }

    center = pageinfo[pageindex];

    d3.select(".active")
        .classed("active", false)
        .transition()
        .duration(200)
        .style("fill", "white");

    d3.selectAll(".progress-circle")
        .filter(function(d) {
            return d == pageindex;
        })
        .classed("active", true)
        .transition()
        .duration(200)
        .style("fill", "black");

    d3.select("#text-container")
        .html(center[3]);

    canvas.transition()
        .duration(2000)
        .call(zoom.transform, transform);
}
